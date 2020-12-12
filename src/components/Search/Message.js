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
function Message(props) {
  const message = props.message;
  const search = props.search;
  const toRender = message.matching_terms.some((substring) =>
    substring.toLowerCase().includes(search.toLowerCase())
  );
  const titleHighlight = message.message
    .toLowerCase()
    .includes(search.toLowerCase())
    ? 'highlight'
    : '';
  const highlight = message.author.includes(search.toLowerCase())
    ? 'secondary'
    : '';

  const timeStamp = message.timestamp.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const addAnim = !! props.animate ? 'new':''

  const card = (
    <div>
      <Card className={`search-message ${addAnim}`} variant="outlined">
        <CardContent className="search-file__box">
          <div className="search-file__type">
            <Tooltip title={message.author}>
              <IconButton
                aria-label={message.author}
                className="search-file_users-item"
                color={highlight}
              >
                {message.author.slice(0, 1).toUpperCase()}
              </IconButton>
            </Tooltip>
          </div>
          <div className="search-message__box">
            says:
            <Typography
              className={`search-file__title ${titleHighlight}`}
              variant="h6"
              component="h2"
            >
              {message.message}
            </Typography>
          </div>
          <div className="search-file__date-box">
            <div className="search-message__channel-box">{message.channel}</div>
            <Typography
              className="search-message__date-date"
              variant="h6"
            >{timeStamp}</Typography>
            <Typography
              className="search-file__date-month"
              color="textSecondary"
            >
              {` ${message.timestamp.getDate()},${
                dateMap[message.timestamp.getMonth()]
              }`}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  return <div>{toRender ? card : null}</div>;
}

export default Message;
