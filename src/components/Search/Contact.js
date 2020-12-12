import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import CardContent from '@material-ui/core/CardContent';
import { Email } from '@material-ui/icons';
import './SearchComponents.css';
import PhoneIcon from '@material-ui/icons/Phone';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';

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
function Contact(props) {
  const contact = props.contact;
  const search = props.search;
  const toRender = contact.matching_terms.some((substring) =>
    substring.toLowerCase().includes(search.toLowerCase())
  );
  const [list, setList] = useState([]);
  const highlight = contact.name.toLowerCase().includes(search.toLowerCase())
    ? '-secondary'
    : '';
  const symbol = (
    <div
      aria-label={contact.name}
      className={`search-contact_users-item${highlight}`}
      color={highlight}
    >
      {contact.name.slice(0, 1).toUpperCase()}
    </div>
  );
  const listDisplay = list.map((listItem) => {
    return <div className="search-contact__phone">{listItem}</div>;
  });
  const card = (
    <div>
      <Card className="search-contact" variant="outlined">
        <CardContent className="search-contact__box">
          <div className="search-contact__box-top">
            <div className="search-contact__sybmol">{symbol}</div>
            <div className={`search-contact__name`}>{contact.name}</div>
            <div className="search-contact__date">
              {' '}
              {contact.last_contact.getDate()}
              <div className="search-contact__date-month">
                {dateMap[contact.last_contact.getMonth()]}
              </div>
            </div>
          </div>
          <Divider />
          <CardActions>
            <Button
              size="small"
              color="primary"
              className="search-contact__email-box"
              onClick={() => {
                setList(contact.emails);
              }}
            >
              <Email fontSize="large" />
            </Button>

            <Button
              size="small"
              color="primary"
              className="search-contact__number-box"
              onClick={() => {
                setList(contact.phones);
              }}
            >
              <PhoneIcon fontSize="large" />
            </Button>
          </CardActions>
          <div className="search-contact__number-list">{listDisplay}</div>
        </CardContent>
      </Card>
    </div>
  );
  return <div>{toRender ? card : null}</div>;
}

export default Contact;
