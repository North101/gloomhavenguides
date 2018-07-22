import * as React from 'react';
import { Link } from 'react-router-dom';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect, Dispatch } from 'react-redux'

import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CircularProgress from '@material-ui/core/CircularProgress';

import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import green from '@material-ui/core/colors/green';

import * as actions from './actions'
import { userState } from './reducers'
import { UserStateStore, User, UserState } from './types'
import LoginDialog from './login'
import RegisterDialog from './register'


const styles = (theme: Theme) => createStyles({
  flex: {
    flexGrow: 1,
  },
  link: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
  fabProgress: {
    position: 'absolute',
    top: -1,
    left: -1,
    zIndex: 1,
  },
});

interface HeaderProps extends RouteComponentProps<any>, WithStyles<any> {}

interface HeaderState {
  showModal?: 'login' | 'register';
  anchorEl?: any;
  userState: null | "loading" | "success" | "error";
  userError: any;
}

type Props = UserStateStore & actions.UserStateProps & HeaderProps;

class Header extends React.Component<Props, HeaderState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showModal: null,
      anchorEl: null,
      userState: this.props.user && this.props.user.user && "success" || null,
      userError: null,
    };
  }

  componentDidMount() {
    if (this.state.userState != null) return;

    let user = this.props.user;
    if (!user || !user.auth_token) return;

    fetch(`/api/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': user.auth_token,
      },
    }).then(response => {
      if (response.ok) {
        response.json().then((data: User) => {
          this.setState({
            userState: "success",
            userError: null,
          });
          this.props.setUser({
            auth_token: user.auth_token,
            user: data,
          });
        }).catch((reason: any) => {
          this.setErrorState(null);
        });
      } else {
        response.json().then((data: any) => {
          this.setErrorState(data);
          if (response.status == 403) {
            this.props.setUser(null);
          }
        }).catch((reason: any) => {
          this.setErrorState(null);
        });
      }
    }).catch((reason: any) => {
      this.setErrorState(null);
    });
  }

  setErrorState = (error: any) => {
    this.setState({
      userState: "error",
      userError: null,
    });
  };

  handleMenuLogin = () => {
    this.setState({showModal: 'login'});
    this.handleMenuClose();
  };

  onLoginClose = () => {
    this.setState({showModal: null});
  };

  handleMenuRegister = () => {
    this.setState({showModal: 'register'});
    this.handleMenuClose();
  };

  onRegisterClose = () => {
    this.setState({showModal: null});
  };

  handleMenu = (event: any) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  handleMenuLogout = () => {
    let authToken = this.props.user.auth_token;
    fetch(`/api/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
    }).then(response => {
      if (response.ok) {
        this.props.setUser(null);
      }
    });

    this.handleMenuClose();
  };

  handleMenuProfile = () => {
    this.props.history.push('/profile');
    this.handleMenuClose();
  };

  onNewGuideClick = () => {
    this.props.history.push('/guides/new');
  };

  render() {
    const open = Boolean(this.state.anchorEl);
    const { classes } = this.props;

    return (
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="title" color="inherit" className={classes.flex}>
            <Link className={classes.link} to='/'>Gloomhaven Guides</Link>
          </Typography>
          {this.props.user ? (
            this.props.user.user ? (
              <div>
                <Button
                  onClick={this.onNewGuideClick}
                  aria-haspopup="true"
                  color="inherit"
                >
                  <AddCircleIcon/>
                  <Typography color="inherit" style={{paddingLeft: '8px'}}>
                    New Guide
                  </Typography>
                </Button>
                <Button
                  onClick={this.handleMenu}
                  aria-owns={open ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  color="inherit"
                >
                  <AccountCircle />
                  <Typography color="inherit" style={{paddingLeft: '8px'}}>
                    {this.props.user.user.username}
                  </Typography>
                </Button>
                <Menu
                  id="menu-appbar"
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={this.handleMenuClose}
                >
                  <MenuItem onClick={this.handleMenuProfile}>Profile</MenuItem>
                  <MenuItem onClick={this.handleMenuLogout}>Logout</MenuItem>
                </Menu>
              </div>
            ) : (
              <Button
                onClick={this.handleMenu}
                aria-owns={open ? 'menu-appbar' : null}
                aria-haspopup="true"
                color="inherit"
              >
                <div style={{position: 'relative'}}>
                  <AccountCircle />
                  <CircularProgress size={26} className={classes.fabProgress} color="secondary"/>
                </div>
                <Typography color="inherit" style={{paddingLeft: '8px'}}>
                  Logging In...
                </Typography>
              </Button>
            )
          ) : (
            <div>
              <Button
                onClick={this.handleMenu}
                aria-owns={open ? 'menu-appbar' : null}
                aria-haspopup="true"
                color="inherit"
              >
                <AccountCircle />
                <Typography color="inherit" style={{paddingLeft: '8px'}}>
                  Guest
                </Typography>
              </Button>
              <Menu
                id="menu-appbar"
                anchorEl={this.state.anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={this.handleMenuClose}
              >
                <MenuItem onClick={this.handleMenuLogin}>Login</MenuItem>
                <MenuItem onClick={this.handleMenuRegister}>Register</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
        <LoginDialog
          open={this.state.showModal == 'login'}
          onClose={() => this.onLoginClose()}
        />
        <RegisterDialog
          open={this.state.showModal == 'register'}
          onClose={() => this.onRegisterClose()}
        />
      </AppBar>
    );
  }
}

const mapStateToProps = (state: any, props: HeaderProps): UserStateStore => ({
    user: state.user,
});

const mapDispatchToProps = (dispatch: Dispatch<actions.UserStateProps>): actions.UserStateProps => ({
  setUser: (value?: UserState) => dispatch(actions.setUser(value)),
})

export default withRouter<any>(
  withStyles(styles, { withTheme: true })<any>(
    connect<UserStateStore, actions.UserStateProps, HeaderProps>(mapStateToProps, mapDispatchToProps)(Header)
  )
);
