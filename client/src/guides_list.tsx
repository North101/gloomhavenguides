import * as React from 'react';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { RouteComponentProps, withRouter } from 'react-router';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import CircularProgress from '@material-ui/core/CircularProgress';

import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { distanceInWordsToNow } from 'date-fns';

import * as types from './types'

const actionsStyles = (theme: Theme) => createStyles({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

class TablePaginationActions extends React.Component<any, any> {
  handleFirstPageButtonClick = (event: any) => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = (event: any) => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = (event: any) => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = (event: any) => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
    );
  };

  render() {
    const { classes, count, page, rowsPerPage, theme } = this.props;

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
}

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
  TablePaginationActions,
);


const styles = (theme: Theme) => createStyles({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

interface GuideListProps extends RouteComponentProps<any>, WithStyles<typeof styles> {

}

interface GuideListState {
  data: null | {
    items: types.GuideData[];
    total: number;
  },
  state: null | "loading" | "success" | "error";
  error: any;
  page: number;
  rowsPerPage: number;
}

class SimpleTable extends React.Component<GuideListProps, GuideListState> {
  constructor(props: GuideListProps) {
    super(props);

    this.state = {
      data: {
        items: [],
        total: 0,
      },
      state: null,
      error: null,
      page: 0,
      rowsPerPage: 25,
    }
  }

  componentDidMount() {
    this.setState({
      state: "loading",
      error: null,
    });

    fetch(`/api/guides?count=${this.state.rowsPerPage}&offset=${this.state.rowsPerPage * this.state.page}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(data => this.setState({
        state: "success",
        data: data as {
          items: types.GuideData[],
          total: number,
        },
        error: null,
      }))
      .catch((reason: any) => {
        this.setState({
          state: "error",
          error: null,
        })
      });
  }

  handleChangePage = (event: any, page: number) => {
    this.setState({ page });

    fetch(`/api/guides?count=${this.state.rowsPerPage}&offset=${this.state.rowsPerPage * page}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(data => this.setState({
        state: "success",
        data: data as {
          items: types.GuideData[];
          total: number;
        },
      }))
      .catch(error => this.setState({
        state: "error",
        error: null,
      }));
  };

  handleChangeRowsPerPage = (event: any) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  onRowClick = (data: types.GuideData) => {
    this.props.history.push(`/guides/${data._id}`, data);
  };

  render() {
    const { classes } = this.props;
    const { data, state, error, rowsPerPage, page } = this.state;

    if (state == "error") {
      return <p>{error}</p>;
    } else if (state == "loading" || state == null) {
      return (
        <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CircularProgress className={classes.progress} />
        </div>
      );
    }

    return (
      <Paper className={this.props.classes.root}>
        <Table className={this.props.classes.table}>
          <TableHead>
            <TableRow>
              <TableCell style={{width: '5%'}}>Class</TableCell>
              <TableCell style={{width: '10%'}}>Author</TableCell>
              <TableCell style={{width: '70%'}}>Title</TableCell>
              <TableCell>Last Update</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map(n => {
              return (
                <TableRow hover style={{cursor: 'pointer'}} onClick={() => this.onRowClick(n)} key={n._id}>
                  <TableCell component="th" scope="row">
                    {n.class ? (
                      <img style={{height: '30px'}} src={`/images/${n.class}_icon.png`}/>
                    ) : 'None'}
                  </TableCell>
                  <TableCell>{n.author.username}</TableCell>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{distanceInWordsToNow(new Date(n.modified.toString() + 'Z'))}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={3}
                count={data.total}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActionsWrapped}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    );
  }
}

export default withStyles(styles)(SimpleTable);
