import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import './SearchComponents.css';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import DescriptionIcon from '@material-ui/icons/Description';
const typeMap = {
  docx: <DescriptionIcon />,
  '.pdf': <PictureAsPdfIcon />,
};
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
function File(props) {
  const file = props.file;
  const search = props.search;
  const toRender = file.matching_terms.some((substring) =>
    substring.toLowerCase().includes(search.toLowerCase())
  );
  const titleHighlight = file.title.toLowerCase().includes(search.toLowerCase())
    ? 'highlight'
    : '';
  const users = !!file.shared_with
    ? file.shared_with.map((user) => {
        const highlight = user.includes(search.toLowerCase())
          ? 'secondary'
          : '';
        return (
          <Tooltip title={user}>
            <IconButton
              aria-label={user}
              className="search-file_users-item"
              color={highlight}
            >
              {user.slice(0, 1).toUpperCase()}
            </IconButton>
          </Tooltip>
        );
      })
    : null;
  const card = (
    <div>
      <Card className="search-file" variant="outlined">
        <CardContent className="search-file__box">
          <div className="search-file__type">
            {typeMap[file.path.slice(file.path.length - 4, file.path.length)]}
          </div>
          <div className="search-file__box">
            <Typography
              className={`search-file__title ${titleHighlight}`}
              variant="h6"
              component="h2"
            >
              {file.title.slice(1, file.title.length - 1)}
            </Typography>
          </div>
          <div className="search-file__date-box">
            <div className="search-file__user-box">
            {users}
            </div>
            <Typography className="search-file__date-date" variant="h6">
              {file.created.getDate()}
            </Typography>
            <Typography
              className="search-file__date-month"
              color="textSecondary"
            >
              {`${
                dateMap[file.created.getMonth()]
              }, ${file.created.getFullYear()}`}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  return <div>{toRender ? card : null}</div>;
}

export default File;
