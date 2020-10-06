# Kanso

[![Netlify Status](https://api.netlify.com/api/v1/badges/7942d3ac-e152-4d41-899a-29b2fab34fdc/deploy-status)](https://app.netlify.com/sites/ekia/deploys)
![Uptime Robot status](https://img.shields.io/uptimerobot/status/m783245224-70f304c2bedc8d7236f8dfdd)
![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783245224-70f304c2bedc8d7236f8dfdd)
![Website](https://img.shields.io/website/https/www.ekia.net)
![GitHub repo size](https://img.shields.io/github/repo-size/EtunaAikido/KansoWeb)
![GitHub WEB last commit](https://img.shields.io/github/last-commit/EtunaAikido/KansoWeb?label=last%20commit%20WEB)
![GitHub last commit](https://img.shields.io/github/last-commit/EtunaAikido/KansoData?label=last%20commit%20DATA)

Senaste versionen av webbsidan för Eskilstuna Ki-Aikido.

Projektnamnet Kanso kommer från en princip inom Zen.

"Kanso (簡素) Simplicity or elimination of clutter. Things are expressed in a plain, simple, natural manner. Reminds us to think not in terms of decoration but in terms of clarity, a kind of clarity that may be achieved through omission or exclusion of the non-essential."

Tanken är att webbsidan så långt det är möjligt ska hållas ren från onödig information. Bara det viktiga ska finnas och vara lätt att nå fram till direkt. Håll det i huvudet när du bygger nya sidor eller förändrar existerande.

# KansoWeb & KansoData

Webbprojektet ligger här under KansoWeb. Innehållet (främst texter) ligger under KansoData, https://github.com/EtunaAikido/KansoData, i json-format. Innehållet läses in på webbsidorna genom javascriptbiblioteket Mavo, https://mavo.io/, som genom att identifiera taggar i html-koden kan fylla dessa med information från json-filerna direkt från github. 

Redigering av innehållet kan göras direkt i json-filerna (helst inte) eller genom ett webbgränssnitt som Mavo tillhandahåller direkt på webbsidan. Det går att nå genom att lägga till ?login efter url-en, dvs https://ekia.net/index?login exempelvis. Detta är för att det ska gå att redigera innehållet av vem som helst utan html-kunskaper och för att separera presentation och innehåll på ett bra sätt.

# Hur kan jag redigera innehållet enklast?

Först behöver du ha ett Github-konto (den här sajten), så börja med att skaffa det på https://github.com/join 

Nu behöver du bli tillagd som användare på KansoData-projektet. Be någon av de som redan är användare att lägga till ditt användarnamn, lista på användare finns här https://github.com/EtunaAikido/KansoData/graphs/contributors

Om du ska lägga till bilder så är det smidigast att vara medlem i KansoWeb också, eftersom de flesta bilder laddas upp till https://github.com/EtunaAikido/KansoWeb/tree/master/images.

Nu är du användare och inloggad i Github, nu behöver du logga in på Mavo. Gå till https://www.ekia.net/index?login, då bör du få upp den här frågan:

![Mavologin](https://github.com/EtunaAikido/KansoWeb/blob/master/images/Inloggning.webp?raw=true)

Välj Yes, log me in. Nu bör du ha följande högst upp i fönstret:

![Mavologin](https://github.com/EtunaAikido/KansoWeb/blob/master/images/Redigerare.webp?raw=true)

Om du väljer Edit så kan du redigera alla fält som är redigerbara på sidan, gäller för alla sidorna på hemsidan, /news, /faq och så vidare. Du får också upp knappar där du kan lägga till exempelvis en ny nyhet eller fråga/svar. Tänk på att det är alltid bäst att lägga till en nyhet på nyhetsidan, frågor/svar på faq-sidan och så vidare, eftersom du där oftast ser fler fält med information än på exempelvis framsidan där en del information kan vara dold (och således inte redigerbar):

![Mavologin](https://github.com/EtunaAikido/KansoWeb/blob/master/images/Editing.webp?raw=true)

När du redigerat färdigt trycker du på Save. Dina ändringar syns direkt på hemsidan. När du skriver text så kan du även formattera den genom Markdown: https://www.markdownguide.org/cheat-sheet/ - Det innebär enkelt beskrivet att om du skriver två * stjärnor före och efter en text så blir texten fetstil, och så vidare. Följ länken så hittar du alla formateringsknep.

Nu är du redo att redigera www.ekia.net, lycka till.

# CSS & JS

Själva webbsidorna är uppbyggda med hjälp av css-biblioteket Semantic UI https://semantic-ui.com/ som hanterar all layout och styling. Det finns väldigt många bra exempel där på hur man gör snygg styling.

Kalendern kommer direkt från Google Calendar, med hjälp av ett js-bibliotek som jag har modifierat kraftigt. Händelser stylas sedan med hjälp av mallar som körs genom templatemotorn Mustache.js. Även tidsbiblioteket Moment.js används för att få ordning på dag och tid i händelserna. I stort sett alla js-bibliotek använder sig även av jQuery.js. Försök så långt det är möjligt att undvika lokala kopior av css/js-bibliotek, länka alltid till ett CDN istället (en hostingtjänst för exempelvis js-bibliotek). Det blir mycket lättare att köra sidorna lokalt då och de laddas även snabbare.

När kod checkas in i KansoWeb så byggs den automatiskt till https://ekia.net genom https://www.netlify.com som också hostar siten genom sitt CDN.

# Vad kan du hjälpa till med?

Det är fritt fram att gå in och fixa till saker som är trasiga, felaktiga eller lägga till sådan som saknas. Försök bara att inte ha sönder något annat under tiden. Det bästa är oftast att forka projektet och sen använda sig av pull requests, då har jag en chans att kolla över dina ändringar innan jag mergar in dom i projektet. Om allt det låter som rappakalja för dig så behöver du läsa på lite kort om hur Git och Github funkar. Manuel är förövrigt kung på det.
