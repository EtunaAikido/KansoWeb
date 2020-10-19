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

    //$('#navBar').append(rendered).$('.pageLoad-hide').hide();


    formatGoogleCalendar.init({
        calendarUrl: 'https://www.googleapis.com/calendar/v3/calendars/etuna.aikido@gmail.com/events?key=process.env.GOOGLE_CALENDAR_KEY',
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
                ['Barnträning', '#ikonBarn'],
                ['Vuxenträning', '#ikonVuxna'],
                ['Ungdomsträning', '#ikonUngdomar'],
                ['Instruktör:', '#mallTagg']
            ]
    });
});

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
    });