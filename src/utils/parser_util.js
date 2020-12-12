export const parseCalendar = (cal) => {
  const calendar = cal;
  calendar.calendar.forEach(function (calendar, index) {
    calendar.date = new Date(calendar.date);
  });
  // sorting my the next appearing date on the calendar (closest to current date)
  calendar.calendar.sort((a, b) => (a.date > b.date ? 1 : -1));
  return calendar.calendar;
};

export const parseFiles = (dropbox) => {
  dropbox.dropbox.forEach(function (dropbox, index) {
    dropbox.created = new Date(dropbox.created);
  });
  //sorting files created by latest created
  dropbox.dropbox.sort((a, b) => (a.created < b.created ? 1 : -1));
  return dropbox.dropbox;
};

export const parseMessages = (slack) => {
  slack.slack.forEach(function (message, index) {
    message.timestamp = new Date(message.timestamp);
  });
  // sorting my earliest message
  slack.slack.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
  return slack.slack;
};

export const parseContancts = (contacts) => {
  contacts.contacts.forEach(function (contact, index) {
    contact.last_contact = new Date(contact.last_contact);
  });
  // sorting with most recent contact being first
  contacts.contacts.sort((a, b) => (a.last_contact < b.last_contact ? 1 : -1));
  return contacts.contacts;
};

export const parseTweets = (tweet) => {
  tweet.tweet.forEach(function (tweet, index) {
    tweet.timestamp = new Date(tweet.timestamp);
  });
  // sorting with latest tweet
  tweet.tweet.sort((a, b) => (a.last_contact > b.last_contact ? 1 : -1));
  return tweet.tweet;
};

export const generateRandomMsg = (msgs) => {
  const msg = {
    id: Math.floor(Math.random() * 1000),
    channel: msgs[Math.floor(Math.random() * msgs.length)].channel,
    author: msgs[Math.floor(Math.random() * msgs.length)].author,
    message: msgs[Math.floor(Math.random() * msgs.length)].message,
    matching_terms:
      msgs[Math.floor(Math.random() * msgs.length)].matching_terms,
    timestamp: new Date(),
  };
  return msg;
};
