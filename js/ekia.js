Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

fetch('templates.html')
.then(response => response.text())
.then(templates => {
// jQuery.get('templates.html', function (templates) {
    html = $('<div />').html(templates).contents();
    $('head').append(html);

    var template = $('#mallNavigation').html();
    var filename = window.location.pathname.split("/").slice(-1)[0].split('.').shift();
    if (filename === '') {
        filename = "index";
    }
    var json = $('#' + filename).html();
    var pageNav = JSON.parse(json);
    var rendered = Mustache.render(template, pageNav);

    Promise.resolve($('#navBar').append(rendered)).then(function(result) {
        $('.pageLoad-hide').hide();
    });

    var socialTemplate = $('#socialNavigation').html();
    $('#bannerimage').append(socialTemplate);
});

// var templates = $('.addDate').each(function(segment) {

//     var dateTemplate = $('#nextDatum').html();
//     var id = segment.id;
//     var 


//     var rendered = Mustache.render(dateTemplate, { date: dateMoment });
//     output = output.concat(rendered);
//     segment.child().add(output);
// });




// find class addDate
// get id of parent
// match parent id to events

// <div class="addDate ui raised segment" mv-multiple property="groups" mv-order="desc" id="[calendarGroup]">
// <div class="ui fluid image">


var hasRun = false;
Mavo.inited
    .then(() => Mavo.all[0].dataLoaded)
    .then(() => {
        $('.placeholder').hide();

        if (!hasRun) {
            var senseis = $("div.senseis");
            //alert(senseis.length);
            var divs = senseis.get().sort(function () {
                return Math.round(Math.random()) - 0.5; //so we get the right +/- combo
            }).slice(0, 3);
            $(divs).show();
            hasRun = true;
        }


            formatGoogleCalendar.init({
                calendarUrl: 'https://www.googleapis.com/calendar/v3/calendars/etuna.aikido@gmail.com/events?key=' + GOOGLE_CALENDAR_KEY,
                past: false,
                upcoming: true,
                sameDayTimes: true,
                dayNames: true,
                pastTopN: 5,
                upcomingTopN: 20,
                daysToShow: 5,
                recurringEvents: true,
                upcomingSelector: '#kalender',
                upcomingHeading: '<h2>Kommande</h2>',
                pastHeading: '<h2>Tidigare</h2>',
                defaultEventTemplates:
                    [
                        ['inställ', '#ikonInstallt'],
                        ['barn', '#ikonBarn'],
                        ['vuxen', '#ikonVuxna'],
                        ['ungdom', '#ikonUngdomar'],
                        ['aikidolek', '#ikonAikidolek'],
                        ['instruktör:', '#mallTagg']

                    ]
            
        });
    });