# AuraStyle Demo Plan

## 1. Cka eshte projekti dhe kujt i sherben

AuraStyle eshte nje aplikacion web me AI qe gjeneron ide veshjesh te personalizuara sipas rastit, preferences se stilit dhe gjuhes se perdoruesit. Projekti u sherben perdoruesve qe duan ndihme te shpejte dhe praktike per te zgjedhur outfit-in e duhur pa humbur kohe.

Projekti ka vlere sepse e kthen nje pyetje te perditshme, "cfare te vesh sot?", ne nje zgjidhje te qarte, te personalizuar dhe te ruajtshme per perdorim te ardhshem.

## 2. Live URL

- Live URL: [https://aurastyle-rinesa.vercel.app](https://aurastyle-rinesa.vercel.app)
- URL eshte verifikuar me sukses me HTTP `200` me 26 Prill 2026

## 3. Qellimi i prezantimit

Qellimi i demos eshte te tregoj qarte flow-n kryesor te aplikacionit nga hyrja ne sistem deri te ruajtja e rezultatit ne database.

Flow-i kryesor qe do te tregoj eshte:

1. hyrja ne sistem
2. gjenerimi i nje outfit-i me AI
3. ruajtja e rekomandimit
4. shfaqja e tij te koleksioni personal

Ky flow eshte zgjedhur sepse demonstron ne menyre te shpejte dhe bindese vleren e produktit dhe funksionalitetet kryesore teknike.

## 4. Flow kryesor qe do ta demonstroj

1. Hap faqen kryesore dhe shpjegoj me nje fjali se cfare ben AuraStyle.
2. Kaloj te `/auth` dhe kycem me nje demo account te pergatitur paraprakisht.
3. Hap `/dashboard` dhe tregoj qe perdoruesi ka qasje te personalizuar ne funksionet kryesore.
4. Kaloj te `/style`.
5. Zgjedh nje rast, p.sh. `Formal`.
6. Shkruaj nje prompt te pergatitur paraprakisht:
   `Formal dinner, neutral colors, elegant but comfortable style.`
7. Zgjedh gjuhen e pergjigjes.
8. Gjeneroj nje ide veshjeje me AI.
9. E ruaj rekomandimin.
10. Hap `/outfits` dhe tregoj qe outfit-i i ruajtur shfaqet ne koleksionin personal.
11. Nese mbetet kohe, tregoj shkurt `edit` ose `delete` per te deshmuar CRUD functionality.

## 5. Plani i prezantimit 5-7 minuta

### 0:00 - 0:40 Hyrja

- Prezantoj projektin me 1-2 fjali.
- Them kujt i sherben.
- E formuloj problemin qe projekti zgjidh.

### 0:40 - 1:20 Zgjidhja dhe vlera

- Shpjegoj qe AuraStyle perdor AI per rekomandime te personalizuara.
- Permend qe aplikacioni mbeshtet Shqip, Gege dhe Anglisht.
- Theksoj vleren praktike: kursim kohe dhe ide me te qarta per veshje.

### 1:20 - 4:50 Live demo

- Landing page
- Sign in
- Dashboard
- Style generator
- Generate result
- Save result
- Outfits collection

### 4:50 - 6:10 Pjesa teknike

- autentikimi me Supabase
- ruajtja e te dhenave ne Supabase
- gjenerimi i rekomandimeve permes Next.js API route dhe Groq
- mbrojtja e route-ve dhe session handling

### 6:10 - 7:00 Mbyllja

- Rikthej shkurt vleren e projektit
- Theksoj qe projekti eshte testuar dhe gati per prezantim
- Permend qe aplikacioni kombinon AI, autentikim dhe ruajtje reale te te dhenave

## 6. Cilat pjese teknike do t'i shpjegoj shkurt

Gjate prezantimit do te shpjegoj vetem pjeset teknike me vlere me te larte:

- `Next.js + React + TypeScript` per frontend dhe routing
- `Supabase Auth` per sign up, sign in dhe session management
- `Supabase PostgreSQL` per ruajtjen e outfit-eve per secilin perdorues
- `Groq API` per gjenerimin e ideve te veshjes me AI
- `Profile page` qe ndihmon ne personalizimin e rekomandimeve te ardhshme
- `Error handling` dhe offline/session states per me shume reliability gjate perdorimit

## 7. Cfare kam kontrolluar para demos

Para prezantimit kam kontrolluar:

- live URL hapet me sukses
- README eshte i perditesuar
- `docs/demo-plan.md` eshte shtuar dhe plotesuar
- `npm run lint` kalon
- production build eshte verifikuar me sukses
- faqet kryesore ekzistojne dhe jane funksionale: `/`, `/auth`, `/dashboard`, `/style`, `/outfits`, `/profile`
- flow kryesor i demos eshte zgjedhur paraprakisht
- shembulli i prompt-it per demo eshte i pergatitur
- demo account eshte i gatshem per prezantim

## 8. Plan B nese live demo deshton

Nese live demo deshton per shkak te internetit, Vercel, Supabase ose AI API:

1. Do te perdor screenshot-e ose screen recording te pergatitura paraprakisht.
2. Do te tregoj te njejtin flow ne materialin backup:
   landing page, auth, style result dhe outfits collection.
3. Do te hap kodin dhe do te shpjegoj implementimin real te pjeseve kryesore:
   `app/api/chat/route.ts`, `app/lib/auth-context.tsx`, `app/lib/outfits-db.ts`.
4. Do te tregoj qe live URL eshte verifikuar paraprakisht dhe qe projekti ka qene funksional para dites se demos.

## 9. Organizimi para dites se prezantimit

- Demo account i gatshem
- Browser tab i hapur paraprakisht
- Live URL e testuar pak para prezantimit
- Screenshot-e ose video backup te gatshme
- Nje prompt i pergatitur paraprakisht
- Interneti i kontrolluar
- Ndryshimet te commit-uara dhe te push-uara ne GitHub

## 10. Pse ky flow eshte zgjedhur

Ky flow eshte zgjedhur sepse tregon ne menyre te qarte kater vlera kryesore te projektit:

1. perdoruesi mund te kycet
2. AI gjeneron vlere reale
3. rezultati ruhet ne database
4. aplikacioni funksionon si produkt real dhe jo vetem si prototype vizual

Kjo e ben prezantimin te qarte, konkret, profesional dhe te lehte per t'u ndjekur brenda 5-7 minutave.
