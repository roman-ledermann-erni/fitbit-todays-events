export function IcsParser() {
};

IcsParser.prototype.parseICS = function(str){
  var self = this
  var lines = str.split(/\r?\n/)
  var ctx = {}
  var stack = []

  for (var i = 0, ii = lines.length, l = lines[0]; i<ii; i++, l=lines[i]){
    //Unfold : RFC#3.1
    while (lines[i+1] && /[ \t]/.test(lines[i+1][0])) {
      l += lines[i+1].slice(1)
      i += 1
    }

    var kv = l.split(":")

    if (kv.length < 2){
      // Invalid line - must have k&v
      continue;
    }

    // Although the spec says that vals with colons should be quote wrapped
    // in practise nobody does, so we assume further colons are part of the
    // val
    var value = kv.slice(1).join(":")
      , kp = kv[0].split(";")
      , name = kp[0]
      , params = kp.slice(1)

    ctx = handleObject(name, value, params, ctx, stack, l) || {}
  }

   // type and params are added to the list of items, get rid of them.
   delete ctx.type
   delete ctx.params

   return ctx
};

IcsParser.prototype.getTimezones = function(records) {
  var timezones = [];
  for (let packedTimezone in records) {
    if (records.hasOwnProperty(packedTimezone) && records[packedTimezone].type === 'VTIMEZONE') {
      let tZone = records[packedTimezone];
      let tzData = { tzid: tZone.tzid};
      
      for(let tzPart in tZone) {
        if (tZone.hasOwnProperty(tzPart)) {
          tzData[tZone[tzPart].type] = tZone[tzPart];
        }
      }
      timezones[tzData.tzid] = tzData;
    }
  }
  return timezones;
};

IcsParser.prototype.getEvents = function(records) {
  var events = [];
  
  for (let packedEvent in records) {
    if (records.hasOwnProperty(packedEvent) && records[packedEvent].type === 'VEVENT') {
      var unpacked = records[packedEvent];
      events.push(unpacked);
    }
  }
  
  return events;
};

const objectHandlers = {
  'BEGIN' : function(component, params, curr, stack) {
      stack.push(curr)
      return {type:component, params:params}
    },

  'END' : function(component, params, curr, stack) {
    // prevents the need to search the root of the tree for the VCALENDAR object
    if (component === "VCALENDAR") {
      //scan all high level object in curr and drop all strings
      var key, obj;

      for (key in curr) {
          if(curr.hasOwnProperty(key)) {
             obj = curr[key];
             if (typeof obj === 'string') {
                 delete curr[key];
             }
          }
      }

      return curr
    }

    var par = stack.pop()
    if (curr.uid)
      {
      	// If this is the first time we run into this UID, just save it.
      	if (par[curr.uid] === undefined) {
          par[curr.uid] = curr;
        } else {
          // If we have multiple ical entries with the same UID, it's either going to be a
          // modification to a recurrence (RECURRENCE-ID), and/or a significant modification
          // to the entry (SEQUENCE).

          // TODO: Look into proper sequence logic.

          if (curr.recurrenceid === undefined) {
            // If we have the same UID as an existing record, and it *isn't* a specific recurrence ID,
            // not quite sure what the correct behaviour should be.  For now, just take the new information
            // and merge it with the old record by overwriting only the fields that appear in the new record.
            var key;
            for (key in curr) {
              par[curr.uid][key] = curr[key];
            }

          }
        }

        	// If we have recurrence-id entries, list them as an array of recurrences keyed off of recurrence-id.
        	// To use - as you're running through the dates of an rrule, you can try looking it up in the recurrences
        	// array.  If it exists, then use the data from the calendar object in the recurrence instead of the parent
        	// for that day.

        	// NOTE:  Sometimes the RECURRENCE-ID record will show up *before* the record with the RRULE entry.  In that
        	// case, what happens is that the RECURRENCE-ID record ends up becoming both the parent record and an entry
        	// in the recurrences array, and then when we process the RRULE entry later it overwrites the appropriate
			// fields in the parent record.

        	if (curr.recurrenceid != null)
        	{

        		// TODO:  Is there ever a case where we have to worry about overwriting an existing entry here?

        		// Create a copy of the current object to save in our recurrences array.  (We *could* just do par = curr,
        		// except for the case that we get the RECURRENCE-ID record before the RRULE record.  In that case, we
        		// would end up with a shared reference that would cause us to overwrite *both* records at the point
				// that we try and fix up the parent record.)
        		var recurrenceObj = new Object();
        		var key;
        		for (key in curr) {
        			recurrenceObj[key] = curr[key];
        		}

        		if (recurrenceObj.recurrences != undefined) {
        			delete recurrenceObj.recurrences;
        		}


				// If we don't have an array to store recurrences in yet, create it.
        		if (par[curr.uid].recurrences === undefined) {
        			par[curr.uid].recurrences = new Array();
            	}

        		// Save off our cloned recurrence object into the array, keyed by date but not time.
        		// We key by date only to avoid timezone and "floating time" problems (where the time isn't associated with a timezone).
				// TODO: See if this causes a problem with events that have multiple recurrences per day.
                if (typeof curr.recurrenceid.toISOString === 'function') {
                  par[curr.uid].recurrences[curr.recurrenceid.toISOString().substring(0,10)] = recurrenceObj;
                } else {
                  console.error("No toISOString function in curr.recurrenceid", curr.recurrenceid);
                }
            }

        	// One more specific fix - in the case that an RRULE entry shows up after a RECURRENCE-ID entry,
        	// let's make sure to clear the recurrenceid off the parent field.
        	if ((par[curr.uid].rrule != undefined) && (par[curr.uid].recurrenceid != undefined))
            {
        		delete par[curr.uid].recurrenceid;
            }

        }
        else
          par[Math.random()*100000] = curr  // Randomly assign ID : TODO - use true GUID

        return par
      },

  'SUMMARY' : storeParam('summary'),
  'DESCRIPTION' : storeParam('description'),
  'URL' : storeParam('url'),
  'UID' : storeParam('uid'),
  'LOCATION' : storeParam('location'),
  'DTSTART' : dateParam('start'),
  'DTEND' : dateParam('end'),
  'EXDATE' : exdateParam('exdate'),
  'CLASS' : storeParam('class'),
  'TRANSP' : storeParam('transparency'),
  'GEO' : geoParam('geo'),
  'PERCENT-COMPLETE': storeParam('completion'),
  'COMPLETED': dateParam('completed'),
  'CATEGORIES': categoriesParam('categories'),
  'FREEBUSY': freebusyParam('freebusy'),
  'DTSTAMP': dateParam('dtstamp'),
  'CREATED': dateParam('created'),
  'LAST-MODIFIED': dateParam('lastmodified'),
  'RECURRENCE-ID': recurrenceParam('recurrenceid')
};

/* Private methods */
function handleObject(name, val, params, ctx, stack, line) {
  if(objectHandlers[name])
    return objectHandlers[name](val, params, ctx, stack, line)

  //handling custom properties
  if(name.match(/X\-[\w\-]+/) && stack.length > 0) {
    //trimming the leading and perform storeParam
    name = name.substring(2);
    return (storeParam(name))(val, params, ctx, stack, line);
  }

  return storeParam(name.toLowerCase())(val, params, ctx);
}

function text(t) {
  t = t || "";
  return (t
    .replace(/\\\,/g, ',')
    .replace(/\\\;/g, ';')
    .replace(/\\[nN]/g, '\n')
    .replace(/\\\\/g, '\\')
  )
}

function parseParams(p) {
  var out = {}
  for (var i = 0; i<p.length; i++){
    if (p[i].indexOf('=') > -1){
      var segs = p[i].split('=');

      out[segs[0]] = parseValue(segs.slice(1).join('='));
    }
  }
  return out || sp
}

function parseValue(val) {
  if ('TRUE' === val)
    return true;

  if ('FALSE' === val)
    return false;

  var number = Number(val);
  if (!isNaN(number))
    return number;

  return val;
}

function storeValParam (name) {
    return function (val, curr) {
        var current = curr[name];
        if (Array.isArray(current)) {
            current.push(val);
            return curr;
        }

        if (current != null) {
            curr[name] = [current, val];
            return curr;
        }

        curr[name] = val;
        return curr
    }
}

function storeParam (name) {
    return function (val, params, curr) {
        var data;
        if (params && params.length && !(params.length == 1 && params[0] === 'CHARSET=utf-8')) {
            data = { params: parseParams(params), val: text(val) }
        }
        else
            data = text(val)

        return storeValParam(name)(data, curr);
    }
}

function addTZ(dt, params) {
  var p = parseParams(params);

  if (params && p){
    dt.tz = p.TZID;
  }

  return dt
}

function dateParam (name) {
  return function (val, params, curr) {

    var newDate = text(val);

    if (params && params[0] === "VALUE=DATE") {
      // Just Date

      var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(val);
      if (comps !== null) {
        // No TZ info - assume same timezone as this computer
        newDate = new Date(
          comps[1],
          parseInt(comps[2], 10)-1,
          comps[3]
        );

        curr["allDay"] = true;
        return storeValParam(name)(newDate, curr)
      }
    }

    //typical RFC date-time format
    var comps = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(val);
    if (comps !== null) {
      if (comps[7] == 'Z'){ // GMT
        newDate = new Date(Date.UTC(
          parseInt(comps[1], 10),
          parseInt(comps[2], 10)-1,
          parseInt(comps[3], 10),
          parseInt(comps[4], 10),
          parseInt(comps[5], 10),
          parseInt(comps[6], 10 )
        ));
        // TODO add tz
      } else {
        newDate = new Date(
          parseInt(comps[1], 10),
          parseInt(comps[2], 10)-1,
          parseInt(comps[3], 10),
          parseInt(comps[4], 10),
          parseInt(comps[5], 10),
          parseInt(comps[6], 10)
        );
      }
      
      var pp = parseParams(params);
      if (params && pp && pp.TZID) {
        curr["tzid" + name] = pp.TZID;
      }
      newDate = addTZ(newDate, params);
    }
    // Store as string - worst case scenario
    return storeValParam(name)(newDate, curr);
  }
}

function geoParam(name) {
  return function(val, params, curr){
    storeParam(val, params, curr)
    var parts = val.split(';');
    curr[name] = {lat:Number(parts[0]), lon:Number(parts[1])};
    return curr
  }
}

function categoriesParam(name) {
  var separatorPattern = /\s*,\s*/g;
  return function (val, params, curr) {
    storeParam(val, params, curr)
    if (curr[name] === undefined)
      curr[name] = val ? val.split(separatorPattern) : []
    else
      if (val)
        curr[name] = curr[name].concat(val.split(separatorPattern))
    return curr
  }
}

function exdateParam(name) {
  return function (val, params, curr) {
    var separatorPattern = /\s*,\s*/g;
    curr[name] = curr[name] || [];
    var dates = val ? val.split(separatorPattern) : [];
    dates.forEach(function (entry) {
        var exdate = new Array();
        dateParam(name)(entry, params, exdate);

        if (exdate[name])
        {
          if (typeof exdate[name].toISOString === 'function') {
            curr[name][exdate[name].toISOString().substring(0, 10)] = exdate[name];
          } else {
            console.error("No toISOString function in exdate[name]", exdate[name]);
          }
        }
      }
    )
    return curr;
  }
}

function recurrenceParam(name) {
    return dateParam(name);
}

function addFBType(fb, params) {
  var p = parseParams(params);

  if (params && p){
    fb.type = p.FBTYPE || "BUSY"
  }

  return fb;
}

function freebusyParam(name) {
  return function(val, params, curr){
    var fb = addFBType({}, params);
    curr[name] = curr[name] || []
    curr[name].push(fb);

    storeParam(val, params, fb);

    var parts = val.split('/');

    ['start', 'end'].forEach(function (name, index) {
      dateParam(name)(parts[index], params, fb);
    });

    return curr;
  }
}