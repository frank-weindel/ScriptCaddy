import React from 'react';
import PropTypes from 'prop-types';
import styles from './LabelBar.modules.less';

export default function LabelBar(props) {
  const { children } = props;
  return <div className={styles.LabelBar}>{children}</div>;
}

LabelBar.propTypes = {
  children: PropTypes.node.isRequired,
};
