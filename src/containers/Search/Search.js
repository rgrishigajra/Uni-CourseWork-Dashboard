import React, { useState, useEffect } from 'react';
import './Search.css';
import CalendarComponent from '../../components/Search/CalendarEvent';
import FileComponent from '../../components/Search/File';
import ContactComponent from '../../components/Search/Contact';
import MessageComponent from '../../components/Search/Message';
import TweetComponent from '../../components/Search/Tweet';
import { Twitter, Description, Chat, Event } from '@material-ui/icons';
import { Puff } from '@agney/react-loading';
import {
  parseCalendar,
  parseFiles,
  parseMessages,
  parseContancts,
  parseTweets,
  generateRandomMsg,
} from './../../utils/parser_util.js';
import ContactsIcon from '@material-ui/icons/Contacts';
import axios from 'axios';
function Search(props) {
  const [calendarEve, setCalender] = useState([]);
  const [contactsEve, setContacts] = useState([]);
  const [slackEve, setSlack] = useState([]);
  const [dropboxEve, setDropbox] = useState([]);
  const [tweetEve, setTweet] = useState([]);
  const [msgEveNew, setMsgNew] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .post(
        `https://us-central1-rishabh-gajra.cloudfunctions.net/dashbaord_data`
      )
      .then((res) => {
        console.log(res.data);
        if (res.data.success == true) {
          console.log(res.data);
          setLoading(false);
          const calendarParsedEvents = parseCalendar(res.data.calendar);
          const filesParsed = parseFiles(res.data.dropbox);
          const slackMessagesParsed = parseMessages(res.data.slack);
          const contactsParsed = parseContancts(res.data.contacts);
          const tweetsParsed = parseTweets(res.data.tweet);
          setCalender(calendarParsedEvents);
          setContacts(contactsParsed);
          setSlack(slackMessagesParsed);
          setDropbox(filesParsed);
          setTweet(tweetsParsed);
          setLoading(false);
        } else {
        }
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(true);
      axios
        .post(
          `https://us-central1-rishabh-gajra.cloudfunctions.net/get_message`
        )
        .then((res) => {
          // console.log(res.data);
          if (res.data.success == true) {
            console.log(res.data);
            const msg = res.data.value;
            msg['timestamp'] = new Date();
            setMsgNew([...msgEveNew, msg]);
            setLoading(false);
          } else {
          }
        });
    }, 60000);
    return () => clearInterval(interval);
  }, [slackEve, msgEveNew]);
  const calendarEvents = calendarEve.map((calendar) => {
    return (
      <CalendarComponent
        calendar={calendar}
        search={props.search}
        key={calendar.id}
      />
    );
  });
  const fileRes = dropboxEve.map((file) => {
    return <FileComponent file={file} search={props.search} key={file.id} />;
  });
  const contactRes = contactsEve.map((contact) => {
    return (
      <ContactComponent
        contact={contact}
        search={props.search}
        key={contact.id}
      />
    );
  });
  const slackRes = slackEve.map((slack) => {
    return (
      <MessageComponent message={slack} search={props.search} key={slack.id} />
    );
  });
  const msgsNew = msgEveNew.map((slack) => {
    return (
      <MessageComponent
        message={slack}
        search={props.search}
        key={slack.id}
        animate
      />
    );
  });
  const tweetRes = tweetEve.map((tweet) => {
    return <TweetComponent tweet={tweet} search={props.search} />;
  });
  const msgs = [...slackRes, ...msgsNew];
  return (
    <div className="search-container">
      <h1>
        Searched Matches in <span className="highlight">pink</span>
      </h1>
      <div className="center">
        <div className="search-container__results">
          <div className="search-calendar-container">
            <h3 className="search-container__title">
              {loading && (
                <div className="loading">
                  <Puff width="100" />
                </div>
              )}{' '}
              <Event fontSize="small" />
              Meetings on calendar:
            </h3>
            <div className="calendar-container__events">{calendarEvents}</div>
          </div>
          <div className="search-container__results-center">
            <div className="file-container">
              <h3 className="search-container__title">
                <Chat fontSize="small" />
                Your recent chat history:
              </h3>
              <div className="dropbox-container__files">{msgs}</div>
            </div>
            <div className="file-container">
              <h3 className="search-container__title">
                <Description fontSize="small" />
                Your files on dropbox:
              </h3>
              <div className="dropbox-container__files">{fileRes}</div>
            </div>
            <div className="file-container">
              <h3 className="search-container__title">
                <Twitter fontSize="small" />
                Tweets from accounts you follow:
              </h3>
              <div className="dropbox-container__files">{tweetRes}</div>
            </div>
          </div>
          <div className="contancts-container">
            <h3 className="search-container__title">
              {' '}
              <ContactsIcon fontSize="small" />
              Recently contacted:
            </h3>
            <div className="contanct-container__contacts">{contactRes}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
