import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

import { Store, createStore } from 'redux'
import { Provider } from 'react-redux'

import { MuiThemeProvider, createMuiTheme, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withTheme } from '@material-ui/core/styles';

import * as actions from './actions'
import { userState } from './reducers'
import { UserStateStore, User, UserState } from './types'

import Header from './header'
import GuidesList from './guides_list'
import GuideView from './guide_view'
import GuideEdit from './guide_edit'
import Login from './login'

const theme = createMuiTheme({
  palette: {
  },
});

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flex: '1',
  },
  toolbar: theme.mixins.toolbar,
});

function initStore(): UserStateStore {
  let authToken = localStorage.getItem('authToken');
  return {
     user: authToken ? {
       auth_token: authToken,
       user: null,
     } : null,
  };
}

const store = createStore<UserStateStore>(userState, initStore());
store.subscribe(() => {
  let user = store.getState().user;
  if (user && user.auth_token) {
    localStorage.setItem('authToken', user.auth_token);
  } else {
    localStorage.removeItem('authToken');
  }
});

function Home(props: any) {
	return <div/>;
}

class App extends React.Component<any, any> {
  render() {
    const {classes} = this.props;

  	return (
      <Provider store={store}>
    		<Router>
    			<div className={classes.root}>
    				<Header />
    				<div style={{display: 'flex', flex: '1', flexDirection: 'column'}}>
    					<div className={classes.toolbar} />
    					<Route path='/' exact={true} component={GuidesList}/>
              <Route path='/guides' exact={true} component={GuidesList}/>
              <Switch>
                <Route path='/guides/new' exact={true} render={(props)=> (
                  <GuideEdit {...props} />
                )}/>
      					<Route path='/guides/:id' exclude='/guides/new' exact={true} render={(props)=> (
                  <GuideView {...props} />
                )}/>
              </Switch>
              <Route path='/guides/:id/edit' exact={true} render={(props)=> (
                <GuideEdit {...props} />
              )}/>
              <Route path='/profile' component={Home}/>
    				</div>
    			</div>
    		</Router>
      </Provider>
  	);
  }
}
const AppStyled = withStyles(styles)(App);

ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<AppStyled/>
	</MuiThemeProvider>,
	document.querySelector('#root')
);
