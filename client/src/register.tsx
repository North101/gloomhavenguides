import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect, Dispatch } from 'react-redux'

import classNames from 'classnames';

import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog'
import CircularProgress from '@material-ui/core/CircularProgress';
import AccountCircle from '@material-ui/icons/AccountCircle';
import CheckIcon from '@material-ui/icons/Check';
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import FormHelperText from '@material-ui/core/FormHelperText'

import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

import * as actions from './actions'
import { userState } from './reducers'
import { UserStateStore, User, UserState } from './types'


const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '300px',
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  buttonError: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

interface RegisterDialogProps extends RouteComponentProps<any>, WithStyles<typeof styles> {
  open: boolean;
  onClose: () => void;
}

interface RegisterDialogState {
  open: boolean;
  state: null | "loading" | "success" | "error";
  error: any;
}

/* use type alias to write less code later */
type Props = UserStateStore & actions.UserStateProps & RegisterDialogProps;

class RegisterDialog extends React.Component<Props, RegisterDialogState> {
  timer: any = null;

  ref: {
    username: HTMLInputElement,
    password: HTMLInputElement,
    confirmPassword: HTMLInputElement,
    inviteCode: HTMLInputElement,
  };

  constructor(props: Props) {
    super(props);

    this.ref = {
      username: null,
      password: null,
      confirmPassword: null,
      inviteCode: null,
    };
    this.state = {
      open: props.open,
      state: null,
      error: null,
    }
  }

  componentWillReceiveProps(props: Props) {
    this.setState({
      open: props.open,
      state: this.props.open && !props.open ? null : this.state.state,
    });
  }

  handleClose = () => {
    this.props.onClose();
  };

  handleRegister = () => {
    let username = this.ref.username.value.trim();
    let password = this.ref.password.value;
    let confirmPassword = this.ref.confirmPassword.value;
    let inviteCode = this.ref.inviteCode.value;

    if (username.length < 4) {
      this.setErrorState({
        fields: {
          username: "Username too short.",
        },
      });
      return;
    } else if (password.length < 8) {
      this.setErrorState({
        fields: {
          password: "Password too short.",
        },
      });
      return;
    } else if (password != confirmPassword) {
      this.setErrorState({
        fields: {
          password: "Passwords don't match.",
          confirm_password: "Passwords don't match.",
        },
      });
      return;
    } else if (!inviteCode) {
      this.setErrorState({
        fields: {
          invite_id: "Invalid Invite Code",
        },
      });
      return;
    }

    this.setState({
      state: "loading",
      error: null,
    });

    fetch(`/api/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        invite_id: inviteCode,
      })
    }).then(response => {
      if (response.ok) {
        response.json().then((data: UserState) => {
          this.props.setUser(data);
          this.setState({
            state: "success",
            error: null,
          });
          this.timer = setTimeout(() => {
            this.handleClose();
          }, 500);
        }).catch((reason: any) => {
          this.setErrorState(null);
        });
      } else {
        response.json().then((data: any) => {
          this.setErrorState(data);
        }).catch((reason: any) => {
          this.setErrorState(null);
        });
      }
    }).catch((reason: any) => {
      this.setErrorState(null);
    });
  }

  setErrorState = (data: any) => {
    this.setState({
      state: 'error',
      error: data,
    });
  };

  render() {
    const { classes } = this.props;
    const { open, state, error } = this.state;
    if (!open) return null;

    const buttonClassname = classNames({
      [classes.buttonSuccess]: state == "success",
      [classes.buttonError]: state == "error",
    });

    let usernameError: string;
    let passwordError: string;
    let confirmPasswordError: string;
    let inviteCodeError: string;
    let generalError: string;
    if (state == "error") {
      if (error) {
        if (error.fields) {
          usernameError = error.fields.username;
          passwordError = error.fields.password;
          confirmPasswordError = error.fields.confirm_password;
          inviteCodeError = error.fields.invite_id;
        } else if (error.type == "UserInvalidInviteError") {
          inviteCodeError = error.message;
        } else if (error.type == "UserUsernameAlreadyExists") {
          usernameError = error.message;
        } else {
          generalError = error.message;
        }
      } else {
        generalError = "Unknown Error.";
      }
    }

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {(state == null || state == "error") && "Register"}
          {state == "loading" && "Registering..."}
          {state == "success" && "Registered!"}
        </DialogTitle>
        <DialogContent>
          {(state == "loading" || state == "success") && (
            <div className={classes.root}>
              <div className={classes.wrapper}>
                <Button
                  variant="fab"
                  color="primary"
                  className={buttonClassname}
                >
                  {state == "loading" && <AccountCircle/>}
                  {state == "success" && <CheckIcon/>}
                </Button>
                {state == "loading" ? <CircularProgress size={68} className={classes.fabProgress} /> : ''}
              </div>
            </div>
          )}
          <div hidden={state == "loading" || state == "success"}>
            <FormControl
              error={!!usernameError}
              aria-describedby="username-text"
              margin="dense"
              fullWidth
              required
            >
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input id="username" inputRef={(ref: HTMLInputElement) => this.ref.username = ref}/>
              <FormHelperText id="username-text">{usernameError}</FormHelperText>
            </FormControl>
            <FormControl
              error={!!passwordError}
              aria-describedby="password-text"
              margin="dense"
              fullWidth
              required
            >
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input id="password" type="password" inputRef={(ref: HTMLInputElement) => this.ref.password = ref}/>
              <FormHelperText id="password-text">{passwordError}</FormHelperText>
            </FormControl>
            <FormControl
              error={!!confirmPasswordError}
              aria-describedby="confirm-password-text"
              margin="dense"
              fullWidth
              required
            >
              <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
              <Input id="confirm-password" type="password" inputRef={(ref: HTMLInputElement) => this.ref.confirmPassword = ref}/>
              <FormHelperText id="confirm-password-text">{confirmPasswordError}</FormHelperText>
            </FormControl>
            <FormControl
              error={!!inviteCodeError}
              aria-describedby="invite-code-text"
              margin="dense"
              fullWidth
              required
            >
              <InputLabel htmlFor="invite-code">Invite Code</InputLabel>
              <Input id="invite-code" type="text" inputRef={(ref: HTMLInputElement) => this.ref.inviteCode = ref}/>
              <FormHelperText id="invite-code-text">{inviteCodeError}</FormHelperText>
            </FormControl>
            {generalError}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary" disabled={state == "loading" || state == "success"}>
            Cancel
          </Button>
          <Button onClick={this.handleRegister} color="primary" disabled={state == "loading" || state == "success"}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: any, props: RegisterDialogProps): UserStateStore => ({
    user: state.user,
});

const mapDispatchToProps = (dispatch: Dispatch<actions.UserStateProps>): actions.UserStateProps => ({
  setUser: (value?: UserState) => dispatch(actions.setUser(value)),
})

export default withRouter<any>(
  withStyles(styles, { withTheme: true })<any>(
    connect<UserStateStore, actions.UserStateProps, RegisterDialogProps>(mapStateToProps, mapDispatchToProps)(RegisterDialog)
  )
);
