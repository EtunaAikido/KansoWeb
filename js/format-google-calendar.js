/**
 * Format Google Calendar JSON output into human readable list
 *
 * Copyright 2015, Milan Kacurak
 *
 */
var formatGoogleCalendar = (function() {

    'use strict';

    var config;

    //Gets JSON from Google Calendar and transfroms it into html list items and appends it to past or upcoming events list
    var init = function(settings) {
        var result = [];

        config = settings;
        var finalURL = settings.calendarUrl;

        moment.updateLocale('sv', {
            calendar: {
                sameDay: '[Idag]',
                nextDay: '[Imorgon]',
                lastDay: '[Igår]',
                nextWeek: 'dddd D MMMM',
                lastWeek: '[I] dddd[s]',
                sameElse: 'dddd D MMMM'
            }
        });

        if (settings.recurringEvents) finalURL = finalURL.concat("&singleEvents=true");
        if (!settings.past) finalURL = finalURL.concat("&orderBy=startTime&timeMin=" + (moment().startOf('day').toISOString()));
        if (settings.upcomingTopN > 0) finalURL = finalURL.concat("&maxResults=" + settings.upcomingTopN);

        //Get JSON, parse it, transform into list items and append it to past or upcoming events list
        jQuery.getJSON(finalURL, function(data) {
            // Remove any cancelled events
            data.items.forEach(function removeCancelledEvents(item) {
                if (item && item.hasOwnProperty('status') && item.status !== 'cancelled') {
                    result.push(item);
                }
            });

            result.sort(comp).reverse();

            var lastDate;

            var pastCounter = 0,
                upcomingCounter = 0,
                pastResult = [],
                upcomingResult = [],
                upcomingResultTemp = [],
                $upcomingElem = jQuery(settings.upcomingSelector),
                $pastElem = jQuery(settings.pastSelector),
                i;

            if (settings.pastTopN === -1) {
                settings.pastTopN = result.length;
            }

            if (settings.upcomingTopN === -1) {
                settings.upcomingTopN = result.length;
            }

            if (settings.past === false) {
                settings.pastTopN = 0;
            }

            if (settings.upcoming === false) {
                settings.upcomingTopN = 0;
            }

            for (i in result) {

                if (isPast(result[i].end.dateTime || result[i].end.date)) {
                    if (pastCounter < settings.pastTopN) {
                       pastResult.push(result[i]);
                       pastCounter++;
                    }
                } else {
                    upcomingResultTemp.push(result[i]);
                }
            }

            upcomingResultTemp.reverse();

            for (i in upcomingResultTemp) {
                if (upcomingCounter < settings.upcomingTopN) {
                    upcomingResult.push(upcomingResultTemp[i]);
                    upcomingCounter++;
                }
            }

            for (i in pastResult) {
                $pastElem.append(semanticTransformationList(pastResult[i], settings.itemsTagName, settings.format));
            }

			var countDays = 0;
			for (i in upcomingResult) {
				if (!isSameDate(new Date(upcomingResult[i].start.dateTime || upcomingResult[i].start.date), lastDate))
					countDays++;
				if (countDays > settings.daysToShow + 1)
					break;

                $upcomingElem.append(semanticTransformationList(upcomingResult[i], settings.itemsTagName, settings.format, lastDate));
                lastDate = new Date(upcomingResult[i].start.dateTime || upcomingResult[i].start.date);
            }

            //if ($upcomingElem.children().length !== 0) {
            //    jQuery(settings.upcomingHeading).insertBefore($upcomingElem);
            //}

            //if ($pastElem.children().length !== 0) {
            //    jQuery(settings.pastHeading).insertBefore($pastElem);
            //}

        });
    };

    //Compare dates
    var comp = function(a, b) {
        return new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.start.dateTime || b.start.date).getTime();
    };

    //Overwrites defaultSettings values with overrideSettings and adds overrideSettings if non existent in defaultSettings
    var mergeOptions = function(defaultSettings, overrideSettings){
        var newObject = {},
            i;
        for (i in defaultSettings) {
            newObject[i] = defaultSettings[i];
        }
        for (i in overrideSettings) {
            newObject[i] = overrideSettings[i];
        }
        return newObject;
    };

    var isAllDay = function (dateStart, dateEnd) {
      var dateStartFormatted = getDateFormatted(dateStart),
          dateEndFormatted = getDateFormatted(dateEnd);

      //if start date is midnight and the end date a following day midnight as well
      if ((dateStartFormatted.getTime() === dateEndFormatted.getTime() - 86400000) &&
          dateStartFormatted.getMinutes() === 0 &&
          dateStartFormatted.getHours() === 0) {
        return true;
      }

      return false;
    };

    var semanticTransformationList = function (result, tagName, format, lastDate) {
    	var dateStart = moment(result.start.dateTime || result.start.date),
            dateEnd = moment(result.end.dateTime || result.end.date),
            moreDaysEvent = moment(dateEnd.subtract(1, 'days')).isAfter(dateStart, 'day'),
            dayNames = config.dayNames,
            isAllDayEvent = isAllDay(dateStart, dateEnd);

    	//kind: "calendar#event",
    	//etag: ""2992450438674000"",
    	//id: "1496137654510",
    	//status: "confirmed",
    	//	htmlLink: "https://www.google.com/calendar/event?eid=MTQ5NjEzNzY1NDUxMCBldHVuYS5haWtpZG9AbQ",
    	//created: "2017-05-31T09:19:24.000Z",
    	//	updated: "2017-05-31T10:06:59.337Z",
    	//	summary: "Instruktör: Johan",
    	//	description: "#kalenderTagg",
    	//	creator: {
    	//	email: "tenkan@gmail.com",
    	//	displayName: "Johan Ahlberg"
    	//},
    	//	organizer: {
    	//	email : "etuna.aikido@gmail.com",
    	//	displayName: "Eskilstuna Ki-Aikido",
    	//self: true
    	//},
    	//	start : {
    	//	date: "2017-06-01"
    	//},
    	//	end: {
    	//	date: "2017-06-02"
    	//},
    	//transparency: "transparent",
    	//	iCalUID: "1496137654510@google.com",
    	//	sequence: 0
    	//},

		if (moreDaysEvent)
			return;

    	if (isAllDayEvent) {
    		dateEnd = subtractOneMinute(dateEnd);
    	}

    	var dateFormatted = getFormattedDate(dateStart, dateEnd, moreDaysEvent, isAllDayEvent, dayNames),
            output = '',
            summary = result.summary || '',
            description = result.description || '',
            location = result.location || '',
            i;

    	var dateMoment = moment(result.start.dateTime || result.start.date).calendar();

    	if (!isSameDate(new Date(result.start.dateTime || result.start.date), lastDate)) {
    		var template = jQuery('#mallDatum').html();
    		Mustache.parse(template);   // optional, speeds up future uses
    		var rendered = Mustache.render(template, { date: dateMoment });
    		output = output.concat(rendered);
    	}

    	var kalenderTemplate = '#mallHandelse';
    	var ikonTemplate = '#ikonHandelse';
    	var re = /(?:^|\W)#(\w+)(?!\w)/g, match, matches =[];

    	var found = jQuery.map(config.defaultEventTemplates, function(item) {
    		if (~summary.indexOf(item[0]))
			{
				while (match = re.exec(item[1])) {
    			//matches.push(match[1]);
				if (~match[0].indexOf('#mall'))
					kalenderTemplate = match[0];
				if (~match[0].indexOf('#ikon'))
					ikonTemplate = match[0];
				};
			}
    	});

    	// Find template hidden in description
    	while (match = re.exec(description)) {
    		//matches.push(match[1]);
    		if (~match[0].indexOf('#mall'))
    			kalenderTemplate = match[0];
    		if (~match[0].indexOf('#ikon'))
    			ikonTemplate = match[0];
    	};
    	description = description.replace(re, '');

    	kalenderTemplate = jQuery(kalenderTemplate).html();
    	ikonTemplate = jQuery(ikonTemplate).html();
    	var timeSpan = '';
    	if (result.start.dateTime)
    		timeSpan = (moment(result.start.dateTime).format('LT-') +moment(result.end.dateTime).format('LT'));

    	//var regexp = /\#\w\w+\s?/g
    	//postText = postText.replace(regexp, '');

    	var metaTemplate = '';

    	if (timeSpan)
    		metaTemplate = metaTemplate.concat(Mustache.render(jQuery('#metaTid').html(), {
    			timespan: timeSpan
    	}));

    	if (location)
    		metaTemplate = metaTemplate.concat(Mustache.render(jQuery('#metaPlats').html(), {
    			location: splitLocation(location),
				address: location
		}));

    	if (description)
            metaTemplate = metaTemplate.concat(Mustache.render(jQuery('#metaBeskrivning').html(), {
    				description: description
    	}));

    	if (kalenderTemplate)
    	{
		Mustache.parse(kalenderTemplate);   // optional, speeds up future uses
		var rendered = Mustache.render(kalenderTemplate, {
				icon: ikonTemplate,
				summary: summary,
				description: description,
				location: location,
				timespan: timeSpan,
    			meta: metaTemplate
    	});
        output = output.concat(rendered);
		}

        return output;
    };
    
    //Check if date is later then now
    var isPast = function(date) {
        var compareDate = new Date(date),
            now = new Date();

        if (now.getTime() > compareDate.getTime()) {
            return true;
        }

        return false;
    };

    //Check if date is the same (disregard time)
    var isSameDate = function (firstDate, secondDate) {

        if (firstDate === undefined || secondDate === undefined)
            return false;

        if ((firstDate.getMonth() === secondDate.getMonth()) && (firstDate.getDate() === secondDate.getDate()) && firstDate.getFullYear() === secondDate.getFullYear()) {
            
            return true;
        }

        return false;
    };

    //Get temp array with information abou day in followin format: [day number, month number, year, hours, minutes]
    var getDateInfo = function(date) {
        date = new Date(date);
        return [date.getDate(), date.getMonth(), date.getFullYear(), date.getHours(), date.getMinutes(), 0, 0];
    };

    //Get month name according to index
    var getMonthName = function (month) {
        var monthNames = [
            'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
        ];

        return monthNames[month];
    };

    var getDayName = function (day) {
      var dayNames = [
          'S&ouml;ndag', 'M&aring;ndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'L&ouml;rdag'
      ];

      return dayNames[day];
    };

    var getDayNameFormatted = function (dateFormatted) {
      return getDayName(getDateFormatted(dateFormatted).getDay()) + ' ';
    };

    var getDateFormatted = function (dateInfo) {
      return new Date(dateInfo[2], dateInfo[1], dateInfo[0], dateInfo[3], dateInfo[4] + 0, 0);
    };

    var getDateNiceFormatted = function (dateInfo) {
        return new Date(dateInfo[2], dateInfo[1], dateInfo[0], dateInfo[3], dateInfo[4] + 0, 0);
    };

    //Add one day
    var addOneDay = function (dateInfo) {
     var date = getDateFormatted(dateInfo);
     date.setTime(date.getTime() + 86400000);
     return getDateInfo(date);
     };
    
    //Subtract one day
    var subtractOneDay = function (dateInfo) {
      var date = getDateFormatted(dateInfo);
      date.setTime(date.getTime() - 86400000);
      return getDateInfo(date);
    };

    //Subtract one minute
    var subtractOneMinute = function (dateInfo) {
      var date = getDateFormatted(dateInfo);
      date.setTime(date.getTime() - 60000);
      return getDateInfo(date);
    };

    //Transformations for formatting date into human readable format
    var formatDateSameDay = function(dateStart, dateEnd, moreDaysEvent, isAllDayEvent, dayNames) {
        var formattedTime = '',
            dayNameStart = '';

        if (dayNames) {
          dayNameStart = getDayNameFormatted(dateStart);
        }

        if (config.sameDayTimes && !moreDaysEvent && !isAllDayEvent) {
            formattedTime = getFormattedTime(dateStart) + ' - ' + getFormattedTime(dateEnd);
        }

        //month day, year time-time
        return dayNameStart + dateStart[0] + ' ' + getMonthName(dateStart[1]);
    };

    var formatDateSameDayOld = function (dateStart, dateEnd, moreDaysEvent, isAllDayEvent, dayNames) {
        var formattedTime = '',
            dayNameStart = '';

        if (dayNames) {
            dayNameStart = getDayNameFormatted(dateStart);
        }

        if (config.sameDayTimes && !moreDaysEvent && !isAllDayEvent) {
            formattedTime = getFormattedTime(dateStart) + ' - ' + getFormattedTime(dateEnd);
        }

        //month day, year time-time
        return dayNameStart + dateStart[0] + ' ' + getMonthName(dateStart[1]) + ', ' + dateStart[2] + formattedTime;
    };

    var formatDateOneDay = function(dateStart, dayNames) {
      var dayName = '';

      if (dayNames) {
        dayName = getDayNameFormatted(dateStart);
      }
      //month day, year
      return dayName + getMonthName(dateStart[1]) + ' ' + dateStart[0] + ', ' + dateStart[2];
    };

    var formatDateDifferentDay = function(dateStart, dateEnd, dayNames) {
      var dayNameStart = '',
          dayNameEnd = '';

      if (dayNames) {
        dayNameStart = getDayNameFormatted(dateStart);
        dayNameEnd = getDayNameFormatted(dateEnd);
      }
        //month day-day, year
      return dayNameStart + dateStart[0] + ' ' + getMonthName(dateStart[1]);
    };

    var formatDateDifferentMonth = function(dateStart, dateEnd, dayNames) {
      var dayNameStart = '',
          dayNameEnd = '';

      if (dayNames) {
        dayNameStart = getDayNameFormatted(dateStart);
        dayNameEnd = getDayNameFormatted(dateEnd);
      }
        //month day - month day, year
        return dayNameStart + getMonthName(dateStart[1]) + ' ' + dateStart[0] + '-' + dayNameEnd + getMonthName(dateEnd[1]) + ' ' + dateEnd[0] + ', ' + dateStart[2];
    };

    var formatDateDifferentYear = function(dateStart, dateEnd, dayNames) {
      var dayNameStart = '',
          dayNameEnd = '';

      if (dayNames) {
        dayNameStart = getDayNameFormatted(dateStart);
        dayNameEnd = getDayNameFormatted(dateEnd);
      }
        //month day, year - month day, year
        return dayNameStart + getMonthName(dateStart[1]) + ' ' + dateStart[0] + ', ' + dateStart[2] + '-' + dayNameEnd + getMonthName(dateEnd[1]) + ' ' + dateEnd[0] + ', ' + dateEnd[2];
    };

    //Check differences between dates and format them
    var getFormattedDate = function(dateStart, dateEnd, moreDaysEvent, isAllDayEvent, dayNames) {
        var formattedDate = '';

        if (dateStart[0] === dateEnd[0]) {
            if (dateStart[1] === dateEnd[1]) {
                if (dateStart[2] === dateEnd[2]) {
                    //month day, year
                    formattedDate = formatDateSameDay(dateStart, dateEnd, moreDaysEvent, isAllDayEvent, dayNames);
                } else {
                    //month day, year - month day, year
                    formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
                }
            } else {
                if (dateStart[2] === dateEnd[2]) {
                    //month day - month day, year
                    formattedDate = formatDateDifferentMonth(dateStart, dateEnd, dayNames);
                } else {
                    //month day, year - month day, year
                    formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
                }
            }
        } else {
            if (dateStart[1] === dateEnd[1]) {
                if (dateStart[2] === dateEnd[2]) {
                    //month day-day, year
                    formattedDate = formatDateDifferentDay(dateStart, dateEnd, dayNames);
                } else {
                    //month day, year - month day, year
                    formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
                }
            } else {
                if (dateStart[2] === dateEnd[2]) {
                    //month day - month day, year
                    formattedDate = formatDateDifferentMonth(dateStart, dateEnd, dayNames);
                } else {
                    //month day, year - month day, year
                    formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
                }
            }
        }

        return formattedDate;
    };

    var getFormattedTime = function (date) {
        var formattedTime = '',
            hour = date[3],
            minute = date[4];

        // Handle midnight.
        if (hour === 0) {
            hour = 24;
        }

        // Ensure 2-digit minute value.
        minute = (minute < 10 ? '0' : '') + minute;

        // Format time.
        formattedTime = hour + ':' + minute;
        return formattedTime;
    };

		function splitLocation(str) {
		 var i = str.indexOf(',');

		 if(i > 0)
		  return str.slice(0, i);
		  else
		  return '';
		  }

    return {
        init: function (settingsOverride) {
            var settings = {
                calendarUrl: 'https://www.googleapis.com/calendar/v3/calendars/milan.kacurak@gmail.com/events?key=AIzaSyCR3-ptjHE-_douJsn8o20oRwkxt-zHStY',
                past: true,
                upcoming: true,
                sameDayTimes: true,
                dayNames: true,
                pastTopN: -1,
                upcomingTopN: -1,
                recurringEvents: true,
                itemsTagName: 'li',
                upcomingSelector: '#events-upcoming',
                pastSelector: '#events-past',
                upcomingHeading: '<h2>Upcoming events</h2>',
                pastHeading: '<h2>Past events</h2>',
                format: ['*date*', ': ', '*summary*', ' &mdash; ', '*description*', ' in ', '*location*'],
				daysToShow: 4
            };

            settings = mergeOptions(settings, settingsOverride);

            init(settings);
        }
    };
})();
