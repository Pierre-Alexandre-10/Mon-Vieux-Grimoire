import PropTypes from 'prop-types';
// import React from 'react';
import React, { useEffect, useState } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useUser } from '../../lib/customHooks';

function Layouts({ showHeader = true, showFooter = true, children }) {
  const [user, setUser] = useState(null);
  const { connectedUser } = useUser();

  useEffect(() => {
    setUser(connectedUser);
  }, [connectedUser]);
  return (
    <div>
      {showHeader && <Header user={user} setUser={setUser} />}
      {children}
      {showFooter && <Footer />}
    </div>
  );
}

Layouts.propTypes = {
  showHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

// Valeurs par défaut des props
Layouts.defaultProps = {
  showHeader: true,
  showFooter: true,
};

export default Layouts;
