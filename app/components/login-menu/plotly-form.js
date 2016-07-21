import React, { Component, PropTypes } from "react";
import { ipcRenderer } from "electron";

import { login } from "../../api/user";
import SocialAuthLinks from "./social-auth-links";
import styles from "./plotly-form.css";
import commonStyles from "./index.css";

const domainUrl = "https://api.plot.ly";

class PlotlyForm extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      errorMessage: null
    };
  }

  handleUserChange = (ev) => {
    this.setState({ username: ev.target.value });
  }

  handlePasswordChange = (ev) => {
    this.setState({ password: ev.target.value });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();

    const { username, password } = this.state;

    if (!username || !password) {
      this.setState({
        errorMessage: "Oops! We do not understand that username/password combination. Please try again."
      });

      return;
    }

    login(domainUrl, username, password)
      .then(this.onLoginSuccess)
      .catch((errorMessage) => {
        this.setState({ errorMessage });
      });
  }

  onLoginSuccess = (userInfo) => {
    this.context.store.api.resetDomainUrl();
    this.context.store.api.setUser(userInfo);
    this.closeModal();
    this.setState({ errorMessage: null });
  }

  onSocialLoginError = (provider) => {
    this.setState({
      errorMessage: `Uh oh! Sign in failed with ${provider}. Please try again.`
    });
  }

  onClickForgotPassword = (ev) => {
    ev.preventDefault();

    ipcRenderer.send("open-external", "https://plot.ly/accounts/password/reset/");
  }

  onClickCreateAccount = (ev) => {
    ev.preventDefault();

    ipcRenderer.send("open-external", "https://plot.ly");
  }

  closeModal = () => {
    this.props.onClose();
    this.setState({ errorMessage: null });
  }

  render() {
    return (
      <div>
        {this.state.errorMessage &&
          <div className={commonStyles.errorMessage}>
            {this.state.errorMessage}
          </div>
        }
        <form
          onSubmit={this.handleSubmit}
          className={commonStyles.form}
        >
          <label className={commonStyles.label}>
            Username
            <input
              className={commonStyles.input}
              type="text"
              name="username"
              value={this.state.username}
              onChange={this.handleUserChange}
            />
          </label>
          <label className={commonStyles.label}>
            Password
            <input
              className={commonStyles.input}
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handlePasswordChange}
            />
          </label>
          <button
            className={commonStyles.button}
            type="submit"
          >
            Sign in
          </button>
          <a
            className={commonStyles.formLink}
            href="https://plot.ly/accounts/password/reset/"
            onClick={this.onClickForgotPassword}
          >
            Forgot password?
          </a>
        </form>
        <SocialAuthLinks
          domain={"https://plot.ly/login"}
          apiUrl={domainUrl}
          onLoginSuccess={this.onLoginSuccess}
          onLoginError={this.onSocialLoginError}
        />
        <div className={commonStyles.signUp}>
          <p className={commonStyles.signUpHeading}>
            Don’t have a plot.ly account?
          </p>
          <a href="http://plot.ly" onClick={this.onClickCreateAccount}>
            Create an account on plot.ly
          </a>
        </div>
      </div>
    );
  }
}

export default PlotlyForm;
