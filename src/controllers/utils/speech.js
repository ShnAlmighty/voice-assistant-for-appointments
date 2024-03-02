const nlp = require('compromise');
const datePlugin = require('compromise-dates');
nlp.plugin(datePlugin)
const moment = require('moment-timezone');

function extractDateTime(text) {
  const doc = nlp(text);
  const dates = doc.dates();
  const date = dates.get()[0].start;
  const date_tz = moment.tz.guess(dates.get()[0].start);
  const date_utc = (new Date(dates.get()[0].start)).toISOString();
  const date_utc_with_tz = moment(date_utc).format();
  return {
    date_utc,
    date_utc_with_tz
  }
};

function reduceConfirmation(input) {
    input = input.toLowerCase();
    // Regular expressions to match patterns for "yes" and "no" responses
    // const yesPatterns = [/^(yes\b|proceed\b)/i, /^(sure\b|go ahead\b)/i, /(\bdo\b)(?!\s+not\b)/i];
    // const noPatterns = [/^(no\b|don't\b)/, /^(no\b|cancel\b|stop\b)/];
    const yesPatterns = [/^(yes\b|proceed\b)/i, /^(sure\b|go ahead\b)/i, /(\bdo\b)(?!\s+not\b)/i, /^(?:I\s+)?want\s+to\b/i];
    const noPatterns = [/(no\b|don't\b|do not\b)/i, /(no\b|cancel\b|stop\b)/i];

    for (const pattern of yesPatterns) {
        if (pattern.test(input)) {
            return "Yes";
        }
    }
    for (const pattern of noPatterns) {
        if (pattern.test(input)) {
            return "No";
        }
    }
    return null;
};

module.exports = {
    extractDateTime,
    reduceConfirmation
}