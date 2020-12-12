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
function CalendarComponent(props) {
  const calendar = props.calendar;
  const search = props.search;
  const toRender = calendar.matching_terms.some((substring) =>
    substring.toLowerCase().includes(search.toLowerCase())
  );
  const titleHighlight = calendar.title
    .toLowerCase()
    .includes(search.toLowerCase())
    ? 'highlight'
    : '';
  const list_invitees = calendar.invitees.split(', ');
  const invitees = list_invitees.map((invitee) => {
    const highlight = invitee.includes(search.toLowerCase()) ? 'secondary' : '';
    return (
      <Tooltip title={invitee}>
        <IconButton
          aria-label={invitee}
          className="search-calendar_invitees-item"
          color={highlight}
        >
          {invitee.slice(0, 1).toUpperCase()}
        </IconButton>
      </Tooltip>
    );
  });
  const card = (
    <div>
      <Card className="search-calendar" variant="outlined">
        <CardContent className="search-calendar__box">
          <div className="search-calendar__date-box">
            <Typography
              className="search-calendar__date"
              variant="h3"
              component="h2"
            >
              {calendar.date.getDate()}
            </Typography>
            <Typography
              className="search-calendar__date-month"
              color="textSecondary"
              gutterBottom
            >
              {`${
                dateMap[calendar.date.getMonth()]
              }, ${calendar.date.getFullYear()}`}
            </Typography>
          </div>

          <div>
            <Typography
              className={`search-calendar__title ${titleHighlight}`}
              variant="h6"
              component="h2"
            >
              {calendar.title}
            </Typography>
            <Typography
              className="search-calendar__date-month"
              color="textSecondary"
              gutterBottom
            >
              {' '}
              Participants:
            </Typography>
            <div className="search-calendar__invitees">{invitees}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  return <div>{toRender ? card : null}</div>;
}

export default CalendarComponent;
