import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import nav from '../../nav';
import photos from '../../photos';

const FILE_FIELD_NAME = 'files';

const renderDropzoneInput = (field) => {
  const files = field.input.value;
  return (
    <div>
      <Dropzone
        name={field.name}
        onDrop={( filesToUpload, e ) => field.input.onChange(filesToUpload)}
      >
        <div>Try dropping some files here, or click to select files to upload.</div>
      </Dropzone>
      {field.meta.touched &&
        field.meta.error &&
        <span className="error">{field.meta.error}</span>}
      {files && Array.isArray(files) && (
        <ul>
          { files.map((file, i) => <li key={i}>{file.name}</li>) }
        </ul>
      )}
    </div>
  );
}

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = { redirect: false };
    }
    
    componentWillMount() {
        this.props.setActive('create')
    }
  setRedirectToTrue() {
    this.setState({ redirect: true });
  }

  onSubmit(data) {
    this.props.postPhotos({ ...data, user_id: this.props.authUserId }, this.setRedirectToTrue.bind(this));
  }

  render() {
    const {
      handleSubmit,
      reset,
    } = this.props;
    if (this.state.redirect) {
      return <Redirect to='/' />
    }
    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <div>
          <label htmlFor={FILE_FIELD_NAME}>Files</label>
          <Field
            name={FILE_FIELD_NAME}
            component={renderDropzoneInput}
          />
          <label>caption:</label>
          <Field name="caption" component="textarea" type="text" />
        </div>
        <div>
          <button type="submit">
            Submit
          </button>
          <button onClick={reset}>
            Clear Values
          </button>
        </div>
      </form>
    );
  }
}

const form = reduxForm({
  form: 'simple',
})(Create);

export default connect((state) => ({authUserId: state.auth.userId}), {postPhotos: photos.actions.postPhotos, setActive: nav.actions.setActive})(form);
