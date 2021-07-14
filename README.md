Install nodejs v14.17.0
run "npm install npm -g"

To start server run "npm run dev"

To update database change db connection string in .env and database type (sqlite, postgresql etc) in prisma/schema.prisma
run "npx prisma db pull"
followed up "npx prisma generate"

Vercel server is run at https://vercel.com/question-matrix-creator/question-matrix-creator
push commits and view on https://question-matrix-creator.vercel.app

To export data go to https://question-matrix-creator.vercel.app/api/export
and save the resulting json file to Personas/assets/questionMatrix.json