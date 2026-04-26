# AuraStyle Demo Plan

## 1. Cka eshte projekti dhe kujt i sherben

AuraStyle eshte nje aplikacion web qe perdor AI per te gjeneruar ide veshjesh te personalizuara. Projekti u sherben perdoruesve qe duan ndihme te shpejte per te zgjedhur outfit-in e duhur sipas rastit, preferencave personale dhe gjuhes qe duan te perdorin.

Vlera kryesore e projektit eshte qe e ben procesin e zgjedhjes se veshjes me te shpejte, me te personalizuar dhe me me pak hezitim per perdoruesin.

## 2. Live URL

- Live URL: [https://aurastyle-rinesa.vercel.app](https://aurastyle-rinesa.vercel.app)
- URL eshte verifikuar me sukses me HTTP `200` me 26 Prill 2026

## 3. Qellimi i prezantimit

Ne demo do te tregoj qarte flow-n kryesor te aplikacionit:

1. hyrja ne sistem
2. gjenerimi i nje outfit-i me AI
3. ruajtja e rekomandimit
4. shfaqja e tij te koleksioni personal

Ky eshte flow-i me i mire sepse tregon vleren e plote te projektit ne pak minuta dhe perfshin funksionalitetet kryesore qe profesori mund t'i vleresoje lehte.

## 4. Flow kryesor qe do ta demonstroj

1. Hap faqen kryesore dhe shpjegoj shkurt se cfare ben AuraStyle.
2. Kaloj te `/auth` dhe kycem me nje demo account te pergatitur paraprakisht.
3. Hap `/dashboard` dhe tregoj qe perdoruesi ka qasje ne zonat kryesore te aplikacionit.
4. Kaloj te `/style`.
5. Zgjedh nje rast, p.sh. `Formal`.
6. Shkruaj nje prompt te shkurter, p.sh.:
   `Formal dinner, neutral colors, elegant but comfortable style.`
7. Zgjedh gjuhen e pergjigjes.
8. Gjeneroj nje ide veshjeje me AI.
9. E ruaj rekomandimin.
10. Hap `/outfits` dhe tregoj qe outfit-i i ruajtur shfaqet ne koleksion.
11. Nese kam kohe, tregoj shkurt edhe `edit` ose `delete` per te deshmuar CRUD.

## 5. Plani i prezantimit 5-7 minuta

### 0:00 - 0:45 Hyrja

- Prezantoj projektin me 1-2 fjali.
- Them kujt i sherben.
- E shpjegoj problemin: zgjedhja e veshjes shpesh merr kohe dhe nuk eshte gjithmone e lehte.

### 0:45 - 1:30 Zgjidhja

- Shpjegoj qe AuraStyle perdor AI per te gjeneruar outfit-e te personalizuara.
- Permend qe aplikacioni mbeshtet Shqip, Gege dhe Anglisht.

### 1:30 - 4:45 Live demo

- Landing page
- Sign in
- Dashboard
- Style generator
- Save outfit
- Outfits collection

### 4:45 - 6:00 Pjesa teknike

Shpjegoj shkurt:

- autentikimin me Supabase
- ruajtjen e te dhenave ne Supabase
- gjenerimin e rekomandimeve permes Next.js API route dhe Groq
- mbrojtjen e route-ve dhe session handling

### 6:00 - 7:00 Mbyllja

- Rikthej vleren e projektit
- Theksoj qe projekti eshte testuar dhe gati per prezantim
- Permend qe projekti kombinon AI me ruajtje reale te te dhenave te perdoruesit

## 6. Cilat pjese teknike do t'i shpjegoj shkurt

Gjate prezantimit nuk do te futem ne detaje te panevojshme, por do te permend vetem pjeset kryesore:

- `Next.js + React + TypeScript` per frontend dhe routing
- `Supabase Auth` per sign up, sign in dhe session management
- `Supabase PostgreSQL` per ruajtjen e outfit-eve te perdoruesit
- `Groq API` per gjenerimin e ideve te veshjes me AI
- profile page qe ndihmon ne personalizimin e rekomandimeve
- error handling dhe offline/session states per me shume reliability

## 7. Cfare kam kontrolluar para demos

Para prezantimit kam kontrolluar:

- live URL hapet me sukses
- README eshte i perditesuar
- `docs/demo-plan.md` eshte shtuar
- `npm run lint` kalon
- production build eshte verifikuar me sukses
- faqet kryesore ekzistojne dhe jane te organizuara:
  - `/`
  - `/auth`
  - `/dashboard`
  - `/style`
  - `/outfits`
  - `/profile`
- flow kryesor i demos eshte zgjedhur paraprakisht
- shembulli i prompt-it per demo eshte i pergatitur
- demo account duhet te jete gati para prezantimit

## 8. Plan B nese live demo deshton

Nese live demo deshton per shkak te internetit, Vercel, Supabase, ose AI API:

1. Do te perdor screenshot-e ose screen recording te pergatitura paraprakisht.
2. Do te tregoj flow-n e plote ne baze te materialit backup:
   - landing page
   - auth
   - style result
   - outfits collection
3. Do te hap kodin dhe do te tregoj implementimin real te pjeseve kryesore:
   - `app/api/chat/route.ts`
   - `app/lib/auth-context.tsx`
   - `app/lib/outfits-db.ts`
4. Do te tregoj qe live URL eshte verifikuar paraprakisht dhe projekti ka qene funksional para demos.

## 9. Organizimi para dites se prezantimit

- Demo account i gatshem
- Browser tab i hapur paraprakisht
- Live URL e testuar pak para prezantimit
- Screenshot-e ose video backup te gatshme
- Nje prompt i pergatitur paraprakisht
- Interneti i kontrolluar
- Ndryshimet te commit-uara dhe te push-uara ne GitHub

## 10. Pse ky flow eshte zgjedhur

Ky flow eshte zgjedhur sepse tregon ne menyre te qarte dhe profesionale kater vlera kryesore te projektit:

1. perdoruesi mund te kycet
2. AI gjeneron vlere reale
3. rezultati ruhet ne database
4. aplikacioni eshte funksional si produkt real, jo vetem si prototype vizual

Kjo e ben prezantimin te qarte, konkret dhe te lehte per t'u ndjekur brenda 5-7 minutave.
