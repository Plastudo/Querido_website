-- Corrige handle_new_user: usava ->>name (coluna) em vez de ->>'name' (chave JSON)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria utilizador de teste admin: supabase@gmail.com / supabase
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'supabase@gmail.com') THEN

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_id, 'authenticated', 'authenticated',
      'supabase@gmail.com',
      crypt('supabase', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin Teste"}',
      false, '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_id, new_id,
      jsonb_build_object('sub', new_id::text, 'email', 'supabase@gmail.com'),
      'email', new_id::text,
      now(), now(), now()
    );

  END IF;
END $$;

-- Registar segundo email admin
INSERT INTO admin_config (key, value)
VALUES ('admin_email_2', 'supabase@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Atualizar is_admin() para suportar lista de emails admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'email') IN (
    SELECT value FROM admin_config WHERE key LIKE 'admin_email%'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
