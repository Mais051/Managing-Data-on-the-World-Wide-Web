import FormContent from './FormContent';
import React, { Component } from 'react';

class FormModal extends Component {
    render() {
        const formContent = <FormContent current_user={this.props.current_user}></FormContent>;
        const modal = this.props.showModal ? <div>{formContent}</div> : null;
        return (
            <div>
                {modal}
            </div>
        );
    }
}

export default FormModal;