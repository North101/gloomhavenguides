import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect, Dispatch } from 'react-redux'

import classNames from 'classnames';

import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import ErrorIcon from '@material-ui/icons/Error';

import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

import * as types from './types'
import * as actions from './actions'
import { userState } from './reducers'
import ImageDialog from './image_dialog'

import deepEqual = require("deep-equal");


const mapStateToProps = (state: any, props: any): types.UserStateStore => ({
    user: state.user,
});

const mapDispatchToProps = (dispatch: Dispatch<actions.UserStateProps>): actions.UserStateProps => ({
  setUser: (value: null | types.UserState) => dispatch(actions.setUser(value)),
})

const GuideSaveDialogStyles = (theme: Theme) => createStyles({
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

interface GuideSaveDialogProps extends RouteComponentProps<any>, WithStyles<typeof GuideSaveDialogStyles> {
  open: boolean;
  id: null | string;
  data: types.GuideData;
  onClose: (data: types.GuideData, success: boolean) => void;
}

interface GuideSaveDialogState {
  open: boolean;
  id: null | string;
  data: types.GuideData;
  state: null | "loading" | "success" | "error";
  error: any;
}

class GuideSaveDialog extends React.Component<types.UserStateStore & actions.UserStateProps & GuideSaveDialogProps, GuideSaveDialogState> {
  timer: any = null;

  constructor(props: types.UserStateStore & actions.UserStateProps & GuideSaveDialogProps) {
    super(props);

    this.state = {
      id: props.id,
      data: props.data,
      open: props.open,
      state: null,
      error: null,
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentWillReceiveProps(props: types.UserStateStore & actions.UserStateProps & GuideSaveDialogProps) {
    this.setState({
      open: props.open,
      state: this.props.open && !props.open ? null : this.state.state,
    });
  }

  componentDidUpdate(oldProps: types.UserStateStore & actions.UserStateProps & GuideSaveDialogProps, oldState: GuideSaveDialogState) {
    if (this.state.open && !oldState.open && this.state.state != "loading") {
      this.setState({
        state: "loading",
      });

      let promise;
      if (this.state.id) {
        promise = fetch(`/api/guides/${this.state.id}`, {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.props.user.auth_token,
          },
          body: JSON.stringify(this.props.data),
        });
      } else {
        promise = fetch(`/api/guides`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.props.user.auth_token,
          },
          body: JSON.stringify(this.props.data),
        });
      }

      promise.then(response => {
        if (response.ok) {
          response.json().then((data: types.GuideData) => {
            this.setState({
              data: data,
              state: "success",
              error: null
            });
            this.timer = setTimeout(() => {
              this.handleClose();
            }, 500);
          }).catch((reason: any) => {
            this.setErrorState(null);
          });
        } else if (response.status) {
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
  }

  setErrorState = (data: any) => {
    this.setState({
      state: 'error',
      error: data,
    });
  };

  handleClose = () => {
    let data = this.state.data;
    this.props.onClose(data, this.state.state == "success");
  };

  render() {
    const { open, state } = this.state;
    const { classes } = this.props;
    if (!open) return null;

    const buttonClassname = classNames({
      [classes.buttonSuccess]: state == "success",
      [classes.buttonError]: state == "error",
    });

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {state == "loading" && 'Saving...'}
          {state == "success" && 'Saved!'}
          {state == "error" && 'Error'}
        </DialogTitle>
        <DialogContent>
          <div className={classes.root}>
            <div className={classes.wrapper}>
              <Button
                variant="fab"
                color="primary"
                className={buttonClassname}
              >
                {state == "loading" && <SaveIcon/>}
                {state == "success" && <CheckIcon />}
                {state == "error" && <ErrorIcon/>}
              </Button>
              {state == "loading" ? <CircularProgress size={68} className={classes.fabProgress} /> : ''}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button disabled={state == "loading"} onClick={this.handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const StyledGuideSaveDialog = withRouter<any>(
  withStyles(GuideSaveDialogStyles, { withTheme: true })<any>(
    connect<types.UserStateStore, actions.UserStateProps, GuideSaveDialogProps>(mapStateToProps, mapDispatchToProps)(GuideSaveDialog)
  )
);

const GuideDeleteDialogStyles = (theme: Theme) => createStyles({
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

interface GuideDeleteDialogProps extends RouteComponentProps<any>, WithStyles<typeof GuideDeleteDialogStyles> {
  open: boolean;
  id: null | string;
  data: types.GuideData;
  onClose: (success: boolean) => void;
}

interface GuideDeleteDialogState {
  open: boolean;
  id: null | string;
  data: types.GuideData;
  state: null | "loading" | "success" | "error";
  error: any;
}

class GuideDeleteDialog extends React.Component<types.UserStateStore & actions.UserStateProps & GuideDeleteDialogProps, GuideDeleteDialogState> {
  timer: any = null;

  constructor(props: types.UserStateStore & actions.UserStateProps & GuideDeleteDialogProps) {
    super(props);

    this.state = {
      id: props.id,
      data: props.data,
      open: props.open,
      state: null,
      error: null,
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentWillReceiveProps(props: types.UserStateStore & actions.UserStateProps & GuideDeleteDialogProps) {
    this.setState({
      open: props.open,
    });
  }

  componentDidUpdate(oldProps: types.UserStateStore & actions.UserStateProps & GuideDeleteDialogProps, oldState: GuideDeleteDialogState) {
    if (this.state.open && !oldState.open && this.state.state != "loading") {
      this.setState({
        state: "loading",
        error: null,
      });

      fetch(`/api/guides/${this.state.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.props.user.auth_token,
        },
      }).then(response => {
        if (response.ok) {
          response.json().then((data: types.GuideData) => {
            this.setState({
              data: data,
              state: "success",
              error: null
            });
            this.timer = setTimeout(() => {
              this.handleClose();
            }, 500);
          }).catch((reason: any) => {
            this.setErrorState(null);
          });
        } else if (response.status) {
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
  }

  setErrorState = (data: any) => {
    this.setState({
      state: 'error',
      error: data,
    });
  };

  handleClose = () => {
    let data = this.state.data;
    this.props.onClose(this.state.state == "success");
    this.setState({
      open: false,
      state: null,
      error: null,
    });
  };

  render() {
    const { state } = this.state;
    const { classes } = this.props;
    const buttonClassname = classNames({
      [classes.buttonSuccess]: state == "success",
      [classes.buttonError]: state == "error",
    });

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {state == "loading" && 'Deleting...'}
          {state == "success" && 'Deleted!'}
          {state == "error" && 'Error'}
        </DialogTitle>
          <DialogContent>
            <div className={classes.root}>
              <div className={classes.wrapper}>
                <Button
                  variant="fab"
                  color="primary"
                  className={buttonClassname}
                >
                  {state == "loading" && <DeleteIcon/>}
                  {state == "success" && <CheckIcon />}
                  {state == "error" && <ErrorIcon/>}
                </Button>
                {state == "loading" ? <CircularProgress size={68} className={classes.fabProgress} /> : ''}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button disabled={state == "loading"} onClick={this.handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
      </Dialog>
    );
  }
}

const StyledGuideDeleteDialog = withRouter<any>(
  withStyles(GuideDeleteDialogStyles, { withTheme: true })<any>(
    connect<types.UserStateStore, actions.UserStateProps, GuideDeleteDialogProps>(mapStateToProps, mapDispatchToProps)(GuideDeleteDialog)
  )
);


const ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

interface ImageLookup {
  id: string,
  name: string,
  image_id?: string;
  items?: ImageLookup[];
}

let imageData = require('./data/image.json') as ImageLookup;

function imageDataToPaths(data: ImageLookup, path: string[]): {[key: string]: string[]} {
  if (data.items == null) {
    path.push(data.id);
    return {[data.id]: path};
  }

  let paths = {};
  for (let [index, item] of data.items.entries()) {
    let itemPath = path.slice();
    itemPath.push(item.id);
    Object.assign(paths, imageDataToPaths(item, itemPath));
  }
  return paths;
}
let imageIdToPath = imageDataToPaths(imageData, []);


class InsertItemButton extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      anchorEl: null,
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  openInsertMenu = (event: any) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  closeInsertMenu = () => {
    this.setState({
      anchorEl: null,
    });
  };

  insertGroup = () => {
    this.props.onInsertItem({
      type: 'group',
      items: [],
      spoiler: null,
    });
    this.closeInsertMenu();
  }
  insertHeader = () => {
    this.props.onInsertItem({
      type: 'header',
      text: "",
    });
    this.closeInsertMenu();
  }
  insertImages = () => {
    this.props.onInsertItem({
      type: 'images',
      images: [],
      spoiler: null,
    });
    this.closeInsertMenu();
  }
  insertComment = () => {
    this.props.onInsertItem({
      type: 'comment',
      text: "",
      spoiler: null,
    });
    this.closeInsertMenu();
  }

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
        <Button variant="contained" color="primary" aria-label="Add" style={{margin: '4px', marginBottom: '8px'}} onClick={this.openInsertMenu}>
          <Icon>add_icon</Icon>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.closeInsertMenu}
        >
          {this.props.group ? (
            <MenuItem onClick={this.insertGroup}>Insert Group</MenuItem>
          ) : ''}
          <MenuItem onClick={this.insertHeader}>Insert Header</MenuItem>
          <MenuItem onClick={this.insertImages}>Insert Images</MenuItem>
          <MenuItem onClick={this.insertComment}>Insert Comment</MenuItem>
        </Menu>
      </div>
    );
  }
}


const GuideEditItemHeaderStyles = (theme: Theme) => createStyles({
  flexRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
  formControl: {
    margin: `${theme.spacing.unit} 0`,
    minWidth: 80,
  },
});

interface GuideEditItemHeaderProps extends WithStyles<typeof GuideEditItemHeaderStyles> {
  id: string,
  item: types.GuideDataItemHeader;
  onItemChange: (itemData: types.GuideDataItemHeader) => void;
}

interface GuideEditItemHeaderState {
  item: types.GuideDataItemHeader;
}

class GuideEditItemHeader extends React.Component<GuideEditItemHeaderProps, GuideEditItemHeaderState> {
  constructor(props: GuideEditItemHeaderProps) {
    super(props);

    this.state = {
      item: props.item,
    }
  }

  shouldComponentUpdate(nextProps: GuideEditItemHeaderProps, nextState: GuideEditItemHeaderState) {
    return !deepEqual(this.state, nextState);
  }

  componentDidUpdate(oldProps: GuideEditItemHeaderProps, oldState: GuideEditItemHeaderState, snapshot: any) {
    if (this.state != oldState) {
      this.props.onItemChange(this.state.item);
    }
  }

  onTextChange = (event: any) => {
    this.setState({
      item: {
        ...this.state.item,
        text: event.target.value
      }
    });
  };

  render() {
    const { item } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.flexRow}>
        <TextField
          className={classes.formControl}
          required
          id="text"
          label="Text"
          type="text"
          fullWidth
          value={item.text || ""}
          onChange={this.onTextChange}
        />
      </div>
    );
  }
}

const StyledGuideEditItemHeader = withStyles(GuideEditItemHeaderStyles, { withTheme: true })(GuideEditItemHeader);


const GuideEditItemImagesStyles = (theme: Theme) => createStyles({
  flex: {
    display: 'flex',
    flexDirection: 'column',
  },
  root: {
    width: '100%',
  },
  formControl: {
    margin: `${theme.spacing.unit}px 0`,
    minWidth: 80,
  },
});

interface GuideEditItemImagesProps extends WithStyles<typeof GuideEditItemImagesStyles> {
  id: string;
  item: types.GuideDataItemImages;
  onItemChange: (itemData: types.GuideDataItemImages) => void;
}

interface GuideEditItemImagesState {
  spoiler: string;
  rows: null | number;
  align: null | "left" | "center" | "right";
  images: {
    id: string;
    image: types.GuideDataItemImage;
  }[]
}

class GuideEditItemImages extends React.Component<GuideEditItemImagesProps, GuideEditItemImagesState> {
  constructor(props: GuideEditItemImagesProps) {
    super(props);

    this.state = {
      spoiler: props.item.spoiler,
      rows: props.item.rows,
      align: props.item.align,
      images: props.item.images.map((image: types.GuideDataItemImage) => {
        return {
          id: ID(),
          image: image,
        };
      }),
    }
  }

  shouldComponentUpdate(nextProps: GuideEditItemImagesProps, nextState: GuideEditItemImagesState) {
    return !deepEqual(this.state, nextState);
  }

  componentDidUpdate(oldProps: GuideEditItemImagesProps, oldState: GuideEditItemImagesState, snapshot: any) {
    if (!deepEqual(this.state, oldState)) {
      this.props.onItemChange({
        type: this.props.item.type,
        spoiler: this.state.spoiler,
        rows: this.state.rows,
        align: this.state.align,
        images: this.state.images.map((image: {id: string, image: types.GuideDataItemImage}) => {
          return image.image;
        }),
      });
    }
  }

  onSpoilerChange = (event: any) => {
    this.setState({
      spoiler: event.target.value,
    });
  };

  onInsertImage = (index: number) => {
    let images = this.state.images.slice();
    images.splice(index, 0, {
      id: ID(),
      image: {
        image: "",
        spoiler: null,
      },
    });
    this.setState({
      images: images,
    });
  };

  onDeleteImage = (index: number) => {
    let images = this.state.images.slice();
    images.splice(index, 1);
    this.setState({
      images: images,
    });
  };

  onImageChange = (index: number, image: types.GuideDataItemImage) => {
    let images = this.state.images.slice();
    images.splice(index, 1, {
      id: images[index].id,
      image: image,
    });
    this.setState({
      images: images
    });
  };

  render() {
    const { spoiler, images } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.flex}>
        <TextField
          className={classes.formControl}
          required
          id="spoiler"
          label="Spoiler"
          type="text"
          fullWidth
          value={spoiler || ""}
          multiline={true}
          rows={3}
          onChange={this.onSpoilerChange}
        />
        </div>
        <div>
          {images.map((item, index) => {
            return <StyledGuideEditItemImagesContainer
              key={item.id}
              index={index}
              image={item.image}
              onInsertImage={this.onInsertImage}
              onDeleteImage={this.onDeleteImage}
              onImageChange={this.onImageChange}
            />
          })}
        </div>
        <Button
          variant="contained"
          color="primary"
          aria-label="Add"
          style={{margin: '4px', marginBottom: '8px'}} 
          onClick={() => this.onInsertImage(images.length)}
        >
          <Icon>add_icon</Icon>
        </Button>
      </div>
    );
  }
}

const StyledGuideEditItemImages = withStyles(GuideEditItemImagesStyles, { withTheme: true })(GuideEditItemImages);


const GuideEditItemImagesContainerStyles = (theme: Theme) => createStyles({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 80,
    alignSelf: 'flex-end'
  },
  flex: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
});

interface GuideEditItemImagesContainerProps extends WithStyles<typeof GuideEditItemImagesContainerStyles> {
  index: number;
  image: null | types.GuideDataItemImage,
  onInsertImage?: (index: number) => void;
  onDeleteImage?: (index: number) => void;
  onImageChange?: (index: number, image: types.GuideDataItemImage) => void;
}

class GuideEditItemImagesContainer extends React.Component<GuideEditItemImagesContainerProps, any> {
  shouldComponentUpdate(nextProps: GuideEditItemImagesContainerProps, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  onInsertImage = () => {
    this.props.onInsertImage(this.props.index);
  };

  onDeleteImage = () => {
    this.props.onDeleteImage(this.props.index);
  }

  onImageChange = (image: types.GuideDataItemImage) => {
    this.props.onImageChange(this.props.index, image);
  }

  render() {
    const {image, classes} = this.props;

    return (
      <div style={{paddingBottom: '20px', display: 'flex', flexDirection: 'row'}}>
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px'}}>
          <Button variant="contained" color="primary" aria-label="Add" style={{margin: '4px', marginBottom: '8px'}} onClick={this.onInsertImage}>
            <Icon>add_icon</Icon>
          </Button>
          <Button variant="contained" color="primary" aria-label="Delete" style={{margin: '4px'}} onClick={this.onDeleteImage}>
            <Icon>delete_icon</Icon>
          </Button>
        </div>
        <Paper className={classes.flex}>
          <StyledGuideEditItemImagesImage image={image} onImageChange={this.onImageChange}/>
        </Paper>
      </div>
    );
  }
}

const StyledGuideEditItemImagesContainer = withStyles(GuideEditItemImagesContainerStyles, { withTheme: true })(GuideEditItemImagesContainer);


const GuideEditItemImagesImageSelector = (props: any) => {
  const { classes, images, index, item } = props;

  return (
    <FormControl key={images.id} className={classes.formControl}>
      <InputLabel htmlFor={images.id}>{images.name}</InputLabel>
      <Select
        value={item ? item.id : ''}
        onChange={(event: any) => props.onSelection(index, event)}
        inputProps={{
          name: 'class',
          id: images.id,
        }}
        SelectDisplayProps={item && item.image_id && {
          style: {
            padding: 0,
          }
        }}
      >
        {images.items.map((item: ImageLookup) => {
          if (item.image_id) {
            return (
              <MenuItem key={item.id} value={item.id}>
                <img className={classes.classIcon} src={`/images/${item.image_id}.png`}/>
              </MenuItem>
            );
          } else {
            return (
              <MenuItem key={item.id} value={item.id}> 
                <em>{item.name}</em>
              </MenuItem>
            );
          } 
        })}
      </Select>
    </FormControl>
  );
}


const GuideEditItemImagesImageStyles = (theme: Theme) => createStyles({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
  formControl: {
    margin: `${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit}px 0`,
    minWidth: 120,
  },
  classIcon: {
    height: '28px',
  },
  select: {
    padding: 0,
  }
});

interface GuideEditItemImagesImageProps extends WithStyles<typeof GuideEditItemImagesImageStyles> {
  image: null | types.GuideDataItemImage;
  onImageChange?: (image: types.GuideDataItemImage) => void;
}

interface GuideEditItemImagesImageState {
  image: string;
  spoiler: null | string;
  selection: string[];
}

class GuideEditItemImagesImage extends React.Component<GuideEditItemImagesImageProps, GuideEditItemImagesImageState> {
  constructor(props: GuideEditItemImagesImageProps) {
    super(props);

    let image = props.image;
    this.state = {
      image: image && image.image,
      spoiler: image && image.spoiler,
      selection: imageIdToPath[image && image.image] || [],
    }
  }

  shouldComponentUpdate(nextProps: GuideEditItemImagesImageProps, nextState: GuideEditItemImagesImageState) {
    return !deepEqual(this.state, nextState);
  }

  componentDidUpdate(oldProps: GuideEditItemImagesImageProps, oldState: GuideEditItemImagesImageState, snapshot: any) {
    if (!deepEqual(this.state, oldState)) {
      this.props.onImageChange({
        image: this.state.image,
        spoiler: this.state.spoiler,
      });
    }
  }

  onSelection = (index: number, event: any) => {
    let value = event.target.value;
    let selection = this.state.selection.slice();
    selection.splice(index, selection.length, value);

    let images = imageData;
    let image: string = null;
    for (let [index, itemId] of selection.entries()) {
      if (images.items == null || images.items == undefined) {
        images = null;
        break;
      }
      let itemIndex = images.items.findIndex((item: ImageLookup) => {
        return item.id == itemId;
      });
      images = images.items[itemIndex];
    }
    if (images != null && (images.items == null || images.items == undefined)) {
      image = images.id;
    }

    this.setState({
      selection: selection,
      image: image,
    });
  };

  onSpoilerChange = (event: any) => {
    this.setState({
      spoiler: event.target.value,
    });
  };

  render() {
    const { image, spoiler, selection } = this.state;
    const { classes } = this.props;
    let images = imageData;

    let selects = [] as any[];

    for (let [index, itemId] of selection.entries()) {
      if (images.items == null || images.items == undefined) {
        images = null;
        break;
      }
      let itemIndex = images.items.findIndex((item: ImageLookup) => {
        return item.id == itemId;
      });
      selects.push((
        <GuideEditItemImagesImageSelector
          classes={classes}
          images={images}
          index={index}
          item={images.items[itemIndex]}
          onSelection={this.onSelection}/>
      ));
      images = images.items[itemIndex];
    }
    if (images != null && images.items != null && images.items != undefined) {
      selects.push(
        <GuideEditItemImagesImageSelector
          classes={classes}
          images={images}
          index={selects.length}
          onSelection={this.onSelection}/>
      );
    }
    return (
      <div className={classes.root}>
        <div className={classes.flexRow}>
          {selects.map((item: any, index: number) => {
            return <div key={index}>{item}</div>;
          })}
        </div>
        <div className={classes.flexRow}>
          <TextField
            className={classes.formControl}
            id="spoiler"
            label="Spoiler"
            type="text"
            fullWidth
            value={spoiler || ""}
            multiline={true}
            rows={1}
            onChange={this.onSpoilerChange}
          />
        </div>
      </div>
    );
  }
}

const StyledGuideEditItemImagesImage = withStyles(GuideEditItemImagesImageStyles, { withTheme: true })(GuideEditItemImagesImage);


const GuideEditItemCommentStyles = (theme: Theme) => createStyles({
  flexRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
  formControl: {
    margin: `${theme.spacing.unit}px 0`,
    minWidth: 80,
  },
});

interface GuideEditItemCommentProps extends WithStyles<typeof GuideEditItemCommentStyles> {
  id: string;
  item: types.GuideDataItemComment;
  onItemChange: (itemData: types.GuideDataItemComment) => void;
}

interface GuideEditItemCommentState {
  text: string;
  spoiler: string;
}

class GuideEditItemComment extends React.Component<GuideEditItemCommentProps, GuideEditItemCommentState> {
  constructor(props: GuideEditItemCommentProps) {
    super(props);

    this.state = {
      text: props.item.text,
      spoiler: props.item.spoiler,
    }
  }

  shouldComponentUpdate(nextProps: GuideEditItemCommentProps, nextState: GuideEditItemCommentState) {
    return !deepEqual(this.state, nextState);
  }

  componentDidUpdate(oldProps: GuideEditItemCommentProps, oldState: GuideEditItemCommentState, snapshot: any) {
    if (!deepEqual(this.state, oldState)) {
      this.props.onItemChange({
        type: this.props.item.type,
        text: this.state.text,
        spoiler: this.state.spoiler,
      });
    }
  }

  onTextChange = (event: any) => {
    this.setState({
      text: event.target.value,
    });
  };

  onSpoilerChange = (event: any) => {
    this.setState({
      spoiler: event.target.value,
    });
  };

  render() {
    const { text, spoiler } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.flexRow}>
        <TextField
          className={classes.formControl}
          required
          id="text"
          label="Text"
          type="text"
          fullWidth
          value={text || ""}
          multiline={true}
          rows={5}
          onChange={this.onTextChange}
        />
        <TextField
          className={classes.formControl}
          id="spoiler"
          label="Spoiler"
          type="text"
          fullWidth
          value={spoiler || ""}
          multiline={true}
          rows={3}
          onChange={this.onSpoilerChange}
        />
      </div>
    );
  }
}

const StyledGuideEditItemComment = withStyles(GuideEditItemCommentStyles, { withTheme: true })(GuideEditItemComment);


const GuideEditItemGroupStyles = (theme: Theme) => createStyles({
  flexRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
  formControl: {
    margin: `${theme.spacing.unit}px 0`,
    minWidth: 80,
  },
  flex: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
});

interface GuideEditItemGroupProps extends WithStyles<typeof GuideEditItemGroupStyles> {
  id: string;
  item: types.GuideDataItemGroup;
  onItemChange: (itemData: types.GuideDataItemGroup) => void;
}

interface GuideEditItemGroupState {
  type: string;
  spoiler: string;
  items: {
    id: string;
    item: types.GuideDataItemGroupItem;
  }[];
}

class GuideEditItemGroup extends React.Component<GuideEditItemGroupProps, GuideEditItemGroupState> {
  constructor(props: GuideEditItemGroupProps) {
    super(props);

    this.state = {
      type: props.item.type,
      spoiler: props.item.spoiler,
      items: props.item.items.map((item: types.GuideDataItemGroupItem) => {
        return {
          id: ID(),
          item: item,
        };
      }),
    }
  }

  shouldComponentUpdate(nextProps: GuideEditItemGroupProps, nextState: GuideEditItemGroupState) {
    return !deepEqual(this.state, nextState);
  }

  componentDidUpdate(oldProps: GuideEditItemGroupProps, oldState: GuideEditItemGroupState, snapshot: any) {
    if (!deepEqual(this.state, oldState)) {
      this.props.onItemChange({
        type: this.props.item.type,
        spoiler: this.state.spoiler,
        items: this.state.items.map((item: {id: string; item: types.GuideDataItemGroupItem;}) => {
          return item.item;
        }),
      });
    }
  }

  onInsertItem = (index: number, itemData: types.GuideDataItemGroupItem) => {
    let items = this.state.items.slice();
    items.splice(index, 0, {
      id: ID(),
      item: itemData
    });
    this.setState({
      items: items
    });
  };

  onDeleteItem = (index: number) => {
    let items = this.state.items.slice();
    items.splice(index, 1);
    this.setState({
      items: items,
    });
  };

  onItemChange = (index: number, itemData: types.GuideDataItemGroupItem) => {
    let items = this.state.items.slice();
    items.splice(index, 1, {
      id: items[index].id,
      item: itemData,
    });
    this.setState({
      items: items,
    });
  };

  onSpoilerChange = (event: any) => {
    this.setState({
      spoiler: event.target.value,
    });
  };

  render() {
    const { spoiler, items } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.flexRow}>
          <TextField
            className={classes.formControl}
            id="spoiler"
            label="Spoiler"
            type="text"
            fullWidth
            value={spoiler || ""}
            multiline={true}
            rows={3}
            onChange={this.onSpoilerChange}
          />
        </div>
        <div>
          {items.map((item, index) => {
            return <StyledGuideEditItemGroupItemContainer
              key={item.id}
              index={index}
              id={item.id}
              item={item.item}
              onInsertItem={this.onInsertItem}
              onDeleteItem={this.onDeleteItem}
              onItemChange={this.onItemChange}
            />
          })}
        </div>
        <InsertItemButton
          onInsertItem={(itemData: types.GuideDataItemGroupItem) => this.onInsertItem(items.length, itemData)}
          group={false}
        />
      </div>
    );
  }
}

const StyledGuideEditItemGroup = withStyles(GuideEditItemGroupStyles, { withTheme: true })(GuideEditItemGroup);


const GuideEditItemContainerStyles = (theme: Theme) => createStyles({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 80,
    alignSelf: 'flex-end'
  },
  flex: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: '20px',
  },
});

interface GuideEditItemContainerProps extends WithStyles<typeof GuideEditItemContainerStyles> {
  index: number;
  id: string;
  item: types.GuideDataItem;
  onInsertItem: (index: number, itemData: types.GuideDataItem) => void;
  onDeleteItem: (index: number) => void;
  onItemChange: (index: number, itemData: types.GuideDataItem) => void;
}

class GuideEditItemContainer extends React.Component<GuideEditItemContainerProps, any> {
  itemToElement = () => {
    const {item} = this.props;

    switch (item.type) {
      case "header": {
        return <StyledGuideEditItemHeader
          id={this.props.id}
          item={item}
          onItemChange={(item: types.GuideDataItemHeader) => this.props.onItemChange(this.props.index, item)}
        />
      }
      case "images": {
        return <StyledGuideEditItemImages
          id={this.props.id}
          item={item}
          onItemChange={(item: types.GuideDataItemImages) => this.props.onItemChange(this.props.index, item)}
        />
      }
      case "comment": {
        return <StyledGuideEditItemComment
          id={this.props.id}
          item={item}
          onItemChange={(item: types.GuideDataItemComment) => this.props.onItemChange(this.props.index, item)}
        />
      }
      case "group": {
        return <StyledGuideEditItemGroup
          id={this.props.id}
          item={item}
          onItemChange={(item: types.GuideDataItemGroup) => this.props.onItemChange(this.props.index, item)}
        />
      }
    }
  }

  shouldComponentUpdate(nextProps: GuideEditItemContainerProps, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  onInsertItem = (itemData: types.GuideDataItem) => {
    this.props.onInsertItem(this.props.index, itemData);
  };

  onDeleteItem = () => {
    this.props.onDeleteItem(this.props.index);
  }

  render() {
    const {item, classes} = this.props;

    return (
      <div style={{paddingBottom: '20px', display: 'flex', flexDirection: 'row'}}>
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px'}}>
          <InsertItemButton
            onInsertItem={this.onInsertItem}
            group={true}
          />
          <Button variant="contained" color="primary" aria-label="Delete" style={{margin: '4px'}} onClick={this.onDeleteItem}>
            <Icon>delete_icon</Icon>
          </Button>
        </div>
        <Paper className={classes.flex}>
          <Typography variant="title">{item.type}</Typography>
          {this.itemToElement()}
        </Paper>
      </div>
    );
  }
}

const StyledGuideEditItemContainer = withStyles(GuideEditItemContainerStyles, { withTheme: true })(GuideEditItemContainer);


interface GuideEditItemGroupItemContainerProps extends WithStyles<typeof GuideEditItemContainerStyles> {
  index: number;
  id: string;
  item: types.GuideDataItemGroupItem;
  onInsertItem: (index: number, itemData: types.GuideDataItemGroupItem) => void;
  onDeleteItem: (index: number) => void;
  onItemChange: (index: number, itemData: types.GuideDataItemGroupItem) => void;
}

class GuideEditItemGroupItemContainer extends React.Component<GuideEditItemGroupItemContainerProps, any> {
  itemToElement = () => {
    const {item} = this.props;

    switch (item.type) {
      case "header": {
        return <StyledGuideEditItemHeader
          id={this.props.id}
          item={item}
          onItemChange={(item: types.GuideDataItemHeader) => this.props.onItemChange(this.props.index, item)}
        />
      }
      case "images": {
        return <StyledGuideEditItemImages
          id={this.props.id}
          item={item}
          onItemChange={(item: types.GuideDataItemImages) => this.props.onItemChange(this.props.index, item)}
        />
      }
      case "comment": {
        return <StyledGuideEditItemComment
          id={this.props.id}
          item={item}
          onItemChange={(item: types.GuideDataItemComment) => this.props.onItemChange(this.props.index, item)}
        />
      }
    }
  }

  shouldComponentUpdate(nextProps: GuideEditItemGroupItemContainerProps, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  onInsertItem = (itemData: types.GuideDataItemGroupItem) => {
    this.props.onInsertItem(this.props.index, itemData);
  };

  onDeleteItem = () => {
    this.props.onDeleteItem(this.props.index);
  }

  render() {
    const {item, classes} = this.props;

    return (
      <div style={{paddingBottom: '20px', display: 'flex', flexDirection: 'row'}}>
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px'}}>
          <InsertItemButton onInsertItem={this.onInsertItem} group={false}/>
          <Button variant="contained" color="primary" aria-label="Delete" style={{margin: '4px'}} onClick={this.onDeleteItem}>
            <Icon>delete_icon</Icon>
          </Button>
        </div>
        <Paper className={classes.flex}>
          <Typography variant="title">{item.type}</Typography>
          {this.itemToElement()}
        </Paper>
      </div>
    );
  }
}

const StyledGuideEditItemGroupItemContainer = withStyles(GuideEditItemContainerStyles, { withTheme: true })(GuideEditItemGroupItemContainer);


const GuideEditStyles = (theme: Theme) => createStyles({
  flex: {
  },
  flexRow: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  root: {
    padding: '20px',
    width: '100%',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 80,
    display: 'inline-block',
  },
  classIcon: {
    height: '28px',
  },
  classNone: {
    margin: '6px 0 7px',
    display: 'block',
  },
  fabEdit: {
    position: 'fixed',
    bottom: '0',
    right: '0',
    margin: '32px',
  },
  fabDelete: {
    position: 'fixed',
    bottom: '60px',
    right: '0',
    margin: '32px',
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});


interface GuideEditProps extends WithStyles<typeof GuideEditStyles>, RouteComponentProps<any> {
  data?: types.GuideData;
}

interface GuideEditItem {
  id: string;
  item: types.GuideDataItem,
}

interface GuideEditState {
  state: null | "loading" | "success" | "error" | "saving" | "deleting" | "preview";
  error: any;
  data: null | types.GuideData;

  title?: string;
  spoiler?: string;
  class?: string;
  items?: GuideEditItem[];
}

class GuideEdit extends React.Component<types.UserStateStore & actions.UserStateProps & GuideEditProps, GuideEditState> {
  constructor(props: types.UserStateStore & actions.UserStateProps & GuideEditProps) {
    super(props);

    this.state = {
      state: null,
      error: null,
      data: null,

      title: null,
      spoiler: null,
      class: null,
      items: null,
    }
  };

  componentDidMount() {
    if (!this.props.match.params.id) {
      this.setState({
        state: "success",
        data: null,
        error: null,

        title: "",
        spoiler: "",
        class: null,
        items: [],
      })
      return;
    }

    let data: types.GuideData;
    if (this.props.data) {
      data = this.props.data;
    } else if (this.props.location.state) {
      //data = this.props.location.state;
    }

    if (data) {
      this.setState({
        state: "success",
        data: data,
        error: null,

        title: data.title,
        spoiler: data.spoiler,
        class: data.class,
        items: data.items.map((item: types.GuideDataItem) => {
          return {
            id: ID(),
            item: item,
          }
        }),
      })
      return;
    }

    this.setState({ state: "loading" });

    fetch(`/api/guides/${this.props.match.params.id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then((data: types.GuideData) => {
        this.setState({
          state: "success",
          data: data,
          error: null,

          title: data.title,
          spoiler: data.spoiler,
          class: data.class,
          items: data.items.map((item: types.GuideDataItem) => {
            return {
              id: ID(),
              item: item,
            }
          }),
        });
      })
      .catch((reason: any) => {
        this.setState({
          state: "error",
          error: null,
        });
      });
  };

  shouldComponentUpdate(nextProps: GuideEditProps, nextState: GuideEditState) {
    return !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState);
  }

  classes = [
    "class_01",
    "class_02",
    "class_03",
    "class_04",
    "class_05",
    "class_06",
    "class_07",
    "class_08",
    "class_09",
    "class_10",
    "class_11",
    "class_12",
    "class_13",
    "class_14",
    "class_15",
    "class_16",
    "class_17",
  ];

  onClassChange = (event: any) => {
    let classId = event.target.value;
    if (classId == 'none') {
      classId = null;
    }

    this.setState({
      class: classId,
    });
  };

  onTitleChange = (event: any) => {
    this.setState({
      title: event.target.value,
    });
  };

  onSpoilerChange = (event: any) => {
    this.setState({
      spoiler: event.target.value,
    });
  };

  onInsertItem = (index: number, itemData: types.GuideDataItem) => {
    let items = this.state.items.slice();
    items.splice(index, 0, {
      id: ID(),
      item: itemData
    });
    this.setState({
      items: items,
    });
  };

  onDeleteItem = (index: number) => {
    let items = this.state.items.slice();
    items.splice(index, 1);
    this.setState({
      items: items,
    });
  };

  onItemChange = (index: number, itemData: types.GuideDataItem) => {
    let items = this.state.items.slice();
    items.splice(index, 1, {
      id: items[index].id,
      item: itemData,
    });
    this.setState({
      items: items,
    });
  };

  onSaveClick = () => {
    this.setState({
      state: "saving",
    });
  };

  onSaveClose = (data: types.GuideData, success: boolean) => {
    if (success) {
      if (this.props.history.location.pathname != `/guides/${data._id}/edit`) {
        this.props.history.push(`/guides/${data._id}/edit`);
        return;
      }

      this.setState({
        state: "success",
        data: data,

        title: data.title,
        spoiler: data.spoiler,
        class: data.class,
        items: data.items.map((item: types.GuideDataItem, index) => {
          return {
            id: this.state.items[index] && this.state.items[index].id || ID(),
            item: item,
          }
        }),
      });
    } else {
      this.setState({
        state: "success",
      });
    }
  };

  onDeleteClick = () => {
    this.setState({
      state: "deleting",
    });
  };

  onDeleteClose = (success: boolean) => {
    if (success) {
      this.props.history.push(`/`);
    }
  };

  onCancelClick = () => {
    if (this.state.data) {
      this.props.history.push(`/guides/${this.state.data._id}`);
    } else {
      this.props.history.push(`/`);
    }
  };

  onPreviewClick = () => {
    this.setState({
      state: "preview",
    });
  };

  render() {
    const { user, classes } = this.props;
    const { data, title, class: classId, spoiler, items, state } = this.state;
    if (state == null || state == "loading" || state == "error") {
      return (
        <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CircularProgress className={classes.progress} />
        </div>
      );
    }

    return (
      <Paper style={{display: 'flex', flex: '1', overflow: 'auto',}}>
        {user && user.user && (!data || user.user._id == data.author._id) ? (
          <div className={classes.fabEdit} style={{display: 'flex', flexDirection: 'column', zIndex: 1000}}>
            <Button style={{marginBottom: '8px'}} variant="fab" color="secondary" aria-label="Cancel" onClick={this.onCancelClick}>
              <Icon>cancel_icon</Icon>
            </Button>
            {data && (
              <Button style={{marginBottom: '8px'}} variant="fab" color="secondary" aria-label="Delete" onClick={this.onDeleteClick}>
                <Icon>delete_icon</Icon>
              </Button>
            )}
            <Button style={{marginBottom: '8px', display: 'none'}} variant="fab" color="secondary" aria-label="Save" onClick={this.onPreviewClick}>
              <Icon>visibility_icon</Icon>
            </Button>
            <Button style={{marginBottom: '8px'}} variant="fab" color="secondary" aria-label="Save" onClick={this.onSaveClick}>
              <Icon>save_icon</Icon>
            </Button>
          </div>
        ) : ''}
        <div className={classes.root}>
          <div className={classes.flex}>
            <div className={classes.flexRow}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="class">Class</InputLabel>
                <Select
                  value={classId || "none"}
                  onChange={this.onClassChange}
                  inputProps={{
                    name: 'class',
                    id: 'class',
                  }}
                  SelectDisplayProps={{
                    style: {
                      paddingTop: 0,
                      paddingBottom: 0,
                    },
                  }}
                >
                  <MenuItem value="none">
                    <em className={classes.classNone}>None</em>
                  </MenuItem>
                  {this.classes.map((value) => {
                    return (
                      <MenuItem key={value} value={value}>
                        <img className={classes.classIcon} src={`/images/${value}_icon.png`}/>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                className={classes.formControl}
                required
                id="title"
                label="Title"
                type="text"
                fullWidth
                value={title}
                onChange={this.onTitleChange}
              />
            </div>
            <div className={classes.flexRow}>
              <TextField
                className={classes.formControl}
                id="spoiler"
                label="Spoiler"
                type="text"
                fullWidth
                multiline={true}
                rows={3}
                value={spoiler || ""}
                onChange={this.onSpoilerChange}
              />
            </div>
          </div>
          <div className={classes.flex} style={{marginTop: '10px'}}>
            {items.map((item, index) => {
              return <StyledGuideEditItemContainer
                key={item.id}
                index={index}
                id={item.id}
                item={item.item}
                onInsertItem={this.onInsertItem}
                onDeleteItem={this.onDeleteItem}
                onItemChange={this.onItemChange}
              />
            })}
          </div>
          <InsertItemButton
            onInsertItem={(itemData: types.GuideDataItem) => this.onInsertItem(items.length, itemData)}
            group={true}
          />
        </div>
        <StyledGuideSaveDialog open={state == "saving"} id={data ? data._id : null} data={{
          ...data,
          title: title,
          class: classId,
          spoiler: spoiler,
          items: items.map((item) => {
            return item.item;
          }),
        }} onClose={this.onSaveClose} />
        <StyledGuideDeleteDialog open={state == "deleting"} id={data ? data._id : null} data={{
          ...data,
          title: title,
          class: classId,
          spoiler: spoiler,
          items: items.map((item) => {
            return item.item;
          }),
        }} onClose={this.onDeleteClose} />
      </Paper>
    );
  }
}

export default withRouter<any>(
  withStyles(GuideEditStyles, { withTheme: true })<any>(
    connect<types.UserStateStore, actions.UserStateProps, GuideEditProps>(mapStateToProps, mapDispatchToProps)(GuideEdit)
  )
);
