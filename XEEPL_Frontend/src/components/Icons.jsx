import React from 'react';
export default function Icon({ name, className = '', ...rest }) {
  return <i className={`fa fa-${name} ${className}`} aria-hidden="true" {...rest} />;
}
