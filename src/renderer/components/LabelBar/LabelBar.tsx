import React, { ReactNode } from 'react';
// import PropTypes from 'prop-types';
import styles from './LabelBar.modules.less';

const LabelBar: React.FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  return <div className={styles.LabelBar}>{children}</div>;
};

export default LabelBar;
