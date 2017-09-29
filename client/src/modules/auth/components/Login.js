import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { selectError } from '../selectors';
import { createStructuredSelector } from 'reselect';

const validate = values => {
  const errors = {}
  if (!values.username) {
    errors.username = 'Please enter a username';
  } else if (values.username.length > 15) {
    errors.username = 'Must be 15 characters or less';
  }
  if (!values.password) {
    errors.password = 'Please enter a password';
  }

  return errors;
}

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error }
}) =>
  <div>
    <label>
      {label}
    </label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched && ((error && <span>{error}</span>))}
    </div>
  </div>

const renderAlert = (error) => {
  if (error) {
    return <div className="alert alert-danger">
      <strong>Oops!</strong> {error}
    </div>
  }
}

const Login = props => {
  const { handleSubmit, pristine, submitting } = props
  return (
    <form onSubmit={handleSubmit(props.submitLogin)}>
      <Field name="username" type="text" component={renderField} label="Username" />
      <Field name="password" type="password" component={renderField} label="Password" />
      <div>
        {renderAlert(props.error)}
        <button type="submit" disabled={pristine || submitting}>
          Submit
        </button>
      </div>
      {"Don't have an account?"} <a onClick={props.toggleDisplay}>Sign up</a>
    </form>
  );
};

export default connect(createStructuredSelector({
  error: selectError
}), actions)(reduxForm({
  form: 'login', // a unique identifier for this form
  validate
})(Login));