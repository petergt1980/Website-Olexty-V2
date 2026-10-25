-- Fungsi untuk mengubah peran pengguna (Hanya Admin)
CREATE OR REPLACE FUNCTION public.admin_assign_user_role(
    target_user_id UUID,
    new_role user_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validasi bahwa pemanggil fungsi adalah admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Akses ditolak. Anda bukan Administrator.';
    END IF;

    -- Perbarui atau tambahkan peran
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, new_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Catat riwayat pada Audit Log
    INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
        auth.uid(),
        'ASSIGN_ROLE',
        'user',
        target_user_id,
        jsonb_build_object('assigned_role', new_role)
    );
END;
$$;

-- Fungsi untuk menangguhkan atau mengembalikan akun anggota
CREATE OR REPLACE FUNCTION public.admin_toggle_user_suspension(
    target_user_id UUID,
    suspend_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_moderator_or_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Akses ditolak. Wewenang tidak mencukupi.';
    END IF;

    UPDATE public.profiles
    SET is_suspended = suspend_status,
        updated_at = NOW()
    WHERE id = target_user_id;

    INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
        auth.uid(),
        CASE WHEN suspend_status THEN 'SUSPEND_USER' ELSE 'RESTORE_USER' END,
        'user',
        target_user_id,
        jsonb_build_object('is_suspended', suspend_status)
    );
END;
$$;

-- Fungsi untuk memproses laporan moderasi
CREATE OR REPLACE FUNCTION public.admin_resolve_report(
    target_report_id UUID,
    new_status report_status,
    hide_target_content BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rec_report RECORD;
BEGIN
    IF NOT public.is_moderator_or_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Akses ditolak. Wewenang tidak mencukupi.';
    END IF;

    SELECT * INTO rec_report FROM public.reports WHERE id = target_report_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Laporan tidak ditemukan.';
    END IF;

    -- Perbarui status laporan
    UPDATE public.reports
    SET status = new_status,
        resolved_by = auth.uid(),
        updated_at = NOW()
    WHERE id = target_report_id;

    -- Sembunyikan konten jika diminta
    IF hide_target_content THEN
        IF rec_report.target_type = 'post' THEN
            UPDATE public.posts SET status = 'hidden' WHERE id = rec_report.target_id;
        ELSIF rec_report.target_type = 'comment' THEN
            UPDATE public.comments SET is_hidden = TRUE WHERE id = rec_report.target_id;
        END IF;
    END IF;

    INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
        auth.uid(),
        'RESOLVE_REPORT',
        'report',
        target_report_id,
        jsonb_build_object('status', new_status, 'content_hidden', hide_target_content)
    );
END;
$$;