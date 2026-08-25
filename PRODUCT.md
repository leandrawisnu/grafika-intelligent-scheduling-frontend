# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **Kurikulum** at **SMK Grafika**, during semester schedule sync. They plot teachers onto jurusan drafts, must see conflicts before lock, choose a resolution, and publish.

Secondary (not the design center): guru (own teaching grid) and siswa (class grid). Super Admin and Admin Jurusan exist in the PRD but were not confirmed as equal design audiences.

## Product Purpose

Help SMK Grafika assemble, sync, and publish lesson timetables so teacher and room clashes are found and resolved before the schedule goes live. Success is a published semester with no remaining blocking conflicts, in less time than manual spreadsheet sync.

## Positioning

AI does not replace kurikulum. It predicts conflicts across jurusan, offers ranked resolutions with explanations, and answers schedule questions in natural language. Neighboring school SIS tools store a timetable; this product’s claim is **cross-jurusan conflict prediction plus choosable, explained fixes**.

## Operating Context

School-day web use (desktop first). Workflow from the PRD: master data → jurusan drafts (subjects, no teacher) → kurikulum plotting → AI Conflict Predictor → sync review → AI Resolve + Explain → publish. Pain today is manual collision hunting after jurusan drafts merge. Prototype at `src/app/` is clickable with in-session mock state (refresh resets). Backend/ML services exist in sibling folders and are out of scope for the current UI prototype.

## Capabilities and Constraints

Confirmed in PRD and/or current prototype:

- Roles: Super Admin, Admin Jurusan, Kurikulum, Guru, Siswa.
- Master data: guru, mapel, jurusan, kelas, semester, tahun ajaran, hari, jam pelajaran, ruangan, teacher off-days / preferences.
- Conflicts: teacher double-booked, room double-booked, over daily hours, teaching on piket/off day.
- AI: Conflict Predictor, Resolve (alternatives A/B/C + confidence), Explain, Schedule Query.
- Publish is gated on a clean schedule.
- UI copy is **Indonesian**.
- Current frontend is a **dummy-data prototype** (no live API, no real auth). Login/RBAC are specified, not shipped in the prototype.

Undecided: official legal school name beyond “SMK Grafika”; whether Admin Jurusan surfaces are in the next design slice; accessibility standard; production hosting.

## Brand Commitments

- Product name: **Grafika Intelligent Scheduling**.
- School: **SMK Grafika**.
- Voice: operational Indonesian; controls name the action (Jalankan Prediksi AI, Terapkan solusi, Publikasi).
- Binding palette from the product owner: clean bright blue, white, slightly gray. Recorded as a constraint only — not a visual world recipe.

## Evidence on Hand

- PRD: `docs/Grafika Intelligent Scheduling - PRD.md` (repo `GIS/docs/`).
- Synthetic SMK Grafika timetable, conflicts, and NL answers: `src/lib/mock/`.
- No real school logo, photography, enrollment stats, or testimonials. Future work must not fabricate them; dummy data must stay labeled synthetic where a visitor could mistake it for fact.

## Product Principles

- Kurikulum decides; AI recommends and explains.
- Sync across jurusan is the job, not a prettier class grid.
- A schedule does not publish while blocking conflicts remain.
- Speak the school’s language; do not invent institutional proof.
- Prototype honesty: mock is demo, not production data.
