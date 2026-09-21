-- Allowlist: uitnodigingen voor e-mail OTP
-- Plak in Supabase → SQL → Run.
-- Bron van waarheid: public.invited_users (geen code-deploy nodig).

-- Nieuwe gebruiker toevoegen (of updaten bij bestaand e-mailadres)
insert into public.invited_users (email, name, role, username, active)
values (
  lower(trim('naam@azgroeninge.be')),
  'Voornaam Achternaam',
  'aso',          -- aso | staff | supervisor | admin | kiosk
  'kortenaam',    -- optioneel; anders null
  true
)
on conflict (email) do update set
  name = excluded.name,
  role = excluded.role,
  username = excluded.username,
  active = excluded.active;

-- Meerdere in één keer
insert into public.invited_users (email, name, role, username, active)
values
  (lower('collega1@azgroeninge.be'), 'Collega Een', 'staff', null, true),
  (lower('collega2@azgroeninge.be'), 'Collega Twee', 'supervisor', null, true)
on conflict (email) do update set
  name = excluded.name,
  role = excluded.role,
  username = excluded.username,
  active = excluded.active;

-- Login intrekken (zonder rij te wissen)
-- update public.invited_users set active = false where email = 'naam@azgroeninge.be';

-- Overzicht
-- select email, name, role, active, created_at from public.invited_users order by name;
