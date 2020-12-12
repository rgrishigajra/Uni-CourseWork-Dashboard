import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import './SearchComponents.css';
const dateMap = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};
function Tweet(props) {
  const tweet = props.tweet;
  const search = props.search;
  const toRender = tweet.matching_terms.some((substring) =>
    substring.toLowerCase().includes(search.toLowerCase())
  );
  const titleHighlight = tweet.message
    .toLowerCase()
    .includes(search.toLowerCase())
    ? 'highlight'
    : '';
  const highlight = tweet.user.includes(search.toLowerCase())
    ? 'secondary'
    : '';

  const timeStamp = tweet.timestamp.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const card = (
    <div>
      <Card className="search-message" variant="outlined">
        <CardContent className="search-file__box">
          <div className="search-file__type">
            <Tooltip title={tweet.user}>
              <IconButton
                aria-label={tweet.user}
                className="search-file_users-item"
                color={highlight}
              >
                {tweet.user.slice(1, 2).toUpperCase()}
              </IconButton>
            </Tooltip>
          </div>
          <div className="search-message__box">
            tweeted:
            <Typography
              className={`search-file__title ${titleHighlight}`}
              variant="h6"
              component="h2"
            >
              {tweet.message}
            </Typography>
          </div>
          <div className="search-file__date-box">
            <Typography className="search-message__date-date" variant="h6">
              {timeStamp}
            </Typography>
            <Typography
              className="search-file__date-month"
              color="textSecondary"
            >
              {` ${tweet.timestamp.getDate()} ${
                dateMap[tweet.timestamp.getMonth()]
              },${tweet.timestamp.getFullYear()}`}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  return <div>{toRender ? card : null}</div>;
}

export default Tweet;
