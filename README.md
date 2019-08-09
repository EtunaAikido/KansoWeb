# Kanso

[![Netlify Status](https://api.netlify.com/api/v1/badges/7942d3ac-e152-4d41-899a-29b2fab34fdc/deploy-status)](https://app.netlify.com/sites/ekia/deploys)
![Uptime Robot status](https://img.shields.io/uptimerobot/status/m783245224-70f304c2bedc8d7236f8dfdd)
![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783245224-70f304c2bedc8d7236f8dfdd)
![Website](https://img.shields.io/website/https/www.ekia.net)
![GitHub repo size](https://img.shields.io/github/repo-size/EtunaAikido/KansoWeb)
![GitHub last commit](https://img.shields.io/github/last-commit/EtunaAikido/KansoWeb)

Senaste versionen av webbsidan för Eskilstuna Ki-Aikido.

Projektnamnet Kanso kommer från en princip inom Zen.

"Kanso (簡素) Simplicity or elimination of clutter. Things are expressed in a plain, simple, natural manner. Reminds us to think not in terms of decoration but in terms of clarity, a kind of clarity that may be achieved through omission or exclusion of the non-essential."

Tanken är att webbsidan så långt det är möjligt ska hållas ren från onödig information. Bara det viktiga ska finnas och vara lätt att nå fram till direkt. Håll det i huvudet när du bygger nya sidor eller förändrar existerande.

# KansoWeb & KansoData

Webbprojektet ligger här under KansoWeb. Innehållet (främst texter) ligger under KansoData, https://github.com/EtunaAikido/KansoData, i json-format. Innehållet läses in på webbsidorna genom javascriptbiblioteket Mavo, https://mavo.io/, som genom att identifiera taggar i html-koden kan fylla dessa med information från json-filerna direkt från github. 

Redigering av innehållet kan göras direkt i json-filerna eller genom ett webbgränssnitt som Mavo tillhandahåller direkt på webbsidan. Det går att nå genom att lägga till ?login efter url-en, dvs http://ekia.net/index?login exempelvis. Detta är för att det ska gå att redigera innehållet av vem som helst utan html-kunskaper och för att separera presentation och innehåll på ett bra sätt.

# CSS & JS

Själva webbsidorna är uppbyggda med hjälp av css-biblioteket Semantic UI https://semantic-ui.com/ som hanterar all layout och styling. Det finns väldigt många bra exempel där på hur man gör snygg styling.

Kalendern kommer direkt från Google Calendar, med hjälp av ett js-bibliotek som jag har modifierat kraftigt. Händelser stylas sedan med hjälp av mallar som körs genom templatemotorn Mustache.js. Även tidsbiblioteket Moment.js används för att få ordning på dag och tid i händelserna. I stort sett alla js-bibliotek använder sig även av jQuery.js. Försök så långt det är möjligt att undvika lokala kopior av css/js-bibliotek, länka alltid till ett CDN istället (en hostingtjänst för exempelvis js-bibliotek). Det blir mycket lättare att köra sidorna lokalt då och de laddas även snabbare.

När kod checkas in i KansoWeb så byggs den automatiskt till https://ekia.net genom https://www.netlify.com som också hostar siten genom sitt CDN.

# Vad kan du hjälpa till med?

Det är fritt fram att gå in och fixa till saker som är trasiga, felaktiga eller lägga till sådan som saknas. Försök bara att inte ha sönder något annat under tiden. Det bästa är oftast att forka projektet och sen använda sig av pull requests, då har jag en chans att kolla över dina ändringar innan jag mergar in dom i projektet. Om allt det låter som rappakalja för dig så behöver du läsa på lite kort om hur Git och Github funkar. Manuel är förövrigt kung på det.
