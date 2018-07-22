import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect, Dispatch } from 'react-redux'

import classNames from 'classnames';

import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import EditIcon from '@material-ui/icons/Edit';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import { distanceInWordsToNow } from 'date-fns';

import * as types from './types'
import * as actions from './actions'
import { userState } from './reducers'
import ImageDialog from './image_dialog'
import GuideViewImage from './guide_image'

import deepEqual = require("deep-equal");


const HeaderDrawerStyles = (theme: Theme) => createStyles({
  drawerPaper: {
    height: '100%',
    position: 'relative',
    width: 240,
    paddingRight: '8px',
    overflowY: 'unset',
  },
});

interface HeaderDrawerProps extends WithStyles<typeof HeaderDrawerStyles> {
  data: types.GuideData;
}

function HeaderDrawer(props: HeaderDrawerProps) {
  const { classes, data } = props;

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Paper style={{overflowY: 'auto', flex: 1, display: 'relative'}}>
        {[].concat(...data.items
          .map((item: types.GuideDataItem, index) => {
            return {index, item};
          })
          .filter(({index, item}: {index: number; item: types.GuideDataItem}) => {
            return item.type == "header" || item.type == "group";
          })
          .map(({index, item}: {index: number; item: types.GuideDataItemHeader | types.GuideDataItemGroup}) => {
            if (item.type == "header") {
              return [{index, subindex: 0, header: item.text, spoiler: false}];
            } else {
              return (
                item.items
                  .filter((subitem) => subitem.type == "header")
                  .map((subitem: types.GuideDataItemHeader, subindex) => {
                    return {index, subindex, header: subitem.text, spoiler: !!item.spoiler}
                })
              );
            }
          }))
          .map(({index, subindex, header, spoiler}: {index: number; subindex: number; header: string, spoiler: boolean}) => {
            return (
              <div key={`#header-${index}-${subindex}`}>
                 <a href={`#header-${index}-${subindex}`} style={{textDecoration: 'none'}}>
                  <ListItem button key={index}>
                    <Typography variant="subheading">{header}</Typography>
                  </ListItem>
                </a>
                <Divider/>
              </div>
            );
        })}
      </Paper>
    </Drawer>
  );
}

const StyledHeaderDrawer = withStyles(HeaderDrawerStyles)(HeaderDrawer);


interface GuideViewItemCommentProps {
  index: number;
  subindex: number;
  item: types.GuideDataItemComment;
}

class GuideViewItemComment extends React.Component<GuideViewItemCommentProps, {}> {
  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  render() {
    return (
      <StyledGuideSpoilerView spoiler={this.props.item.spoiler} index={this.props.index} subindex={this.props.subindex}>
        <div className="guide-item-comment">
          <ReactMarkdown disallowedTypes={['image', 'html', 'imageReference']} source={this.props.item.text}/>
        </div>
      </StyledGuideSpoilerView>
    )
  }
}

interface GuideViewItemImageProps {
  image: types.GuideDataItemImage;
  width: number;
  onClick: () => void;
}

class GuideViewItemImage extends React.Component<GuideViewItemImageProps, any> {
  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  render() {
    if (this.props.image.image.length == 0) return null;

    return (
      <div className="guide-item-image" style={{ width: `${this.props.width}%` }}>
        <StyledGuideSpoilerView spoiler={this.props.image.spoiler} index={0} subindex={0}>
          <GuideViewImage onClick={this.props.onClick} image={this.props.image.image}/>
        </StyledGuideSpoilerView>
      </div>
    )
  }
}

interface GuideViewItemImagesProps {
  index: number;
  subindex: number;
  item: types.GuideDataItemImages;
  onClickImages: (images: types.GuideDataItemImage[], index: number) => void;
}

class GuideViewItemImages extends React.Component<GuideViewItemImagesProps, {spoiler: string;}> {
  constructor(props: GuideViewItemImagesProps) {
    super(props);

    this.state = {
      spoiler: props.item.spoiler,
    };
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  onSpoilerClick = () => {
    this.setState({
      spoiler: null,
    })
  };

  render() {
    let rows = this.props.item.rows || Math.min(this.props.item.images.length, 5);
    let align = this.props.item.align || this.props.item.images.length == 1 ? "center" : "left";

    return (
      <StyledGuideSpoilerView spoiler={this.state.spoiler} index={this.props.index} subindex={this.props.subindex}>
        <div className="guide-item-images" style={{ justifyContent: align }}>
          {this.props.item.images.map((image, index) => {
             return <GuideViewItemImage onClick={() => this.props.onClickImages(this.props.item.images, index)} key={index} image={image} width={1 / rows * 100}/>
          })}
        </div>
      </StyledGuideSpoilerView>
    )
  }
}

interface GuideViewItemHeaderProps {
  index: number;
  subindex: number;
  item: types.GuideDataItemHeader;
}

class GuideViewItemHeader extends React.Component<GuideViewItemHeaderProps, {}> {
  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  render() {
    return (
      <div className="guide-item">
        <div>
          <Typography variant="title" component="h2" id={`header-${this.props.index}-${this.props.subindex}`}>{this.props.item.text}</Typography>
        </div>
      </div>
    )
  }}

interface GuideViewItemGroupProps {
  index: number;
  item: types.GuideDataItemGroup;
  onClickImages: (images: types.GuideDataItemImage[], index: number) => void;
}

export class GuideViewItemGroup extends React.Component<GuideViewItemGroupProps, {}> {
  render() {
    return (
      <div style={{margin: '8px'}}>
        <StyledGuideSpoilerView spoiler={this.props.item.spoiler} index={this.props.index} subindex={0}>
          <Paper className="guide-item-group">
      	      <div className="guide-items">
      	        {this.props.item.items.map((item: types.GuideDataItemGroupItem, index: number) => {
      	          switch (item.type) {
      	            case "header": {
      	              return <GuideViewItemHeader key={index} index={this.props.index} subindex={index} item={item}/>
      	            }
      	            case "images": {
      	              return <GuideViewItemImages key={index} item={item} index={this.props.index} subindex={index} onClickImages={this.props.onClickImages}/>
      	            }
      	            case "comment": {
      	              return <GuideViewItemComment key={index} item={item} index={this.props.index} subindex={index}/>
      	            }
      	          }
      	        })}
      	      </div>
          </Paper>
        </StyledGuideSpoilerView>
      </div>
    );
  }
}


const GuideSpoilerViewStyle = createStyles({
  spoiler: {
    position: 'absolute',
    maxHeight: '100%',
    maxWidth: '100%',
    height: '100%',
    width: '100%',
    backgroundColor: '#cccccc',
    transition: 'opacity 0.2s ease-in-out',
    opacity: 0.7,
    zIndex: 100,
    border: '1px black inset',
    boxSizing: 'border-box',
    textAlign: 'center'
  },
  hideSpoiler: {
    pointerEvents: 'none',
    opacity: 0,
  },
  spoilerText: {
    filter: 'blur(10px)',
  },
});

interface GuideSpoilerViewProps extends WithStyles<typeof GuideSpoilerViewStyle> {
  index: number;
  subindex: number;
  spoiler: string | null;
}

class GuideSpoilerView extends React.Component<GuideSpoilerViewProps, {spoiler: string | null}> {
  constructor(props: GuideSpoilerViewProps) {
    super(props);

    this.state = {
      spoiler: props.spoiler,
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !deepEqual(this.state, nextState);
  }

  onClick = () => {
    this.setState({
      spoiler: null,
    })
  }

  render() {
    const { classes, index, subindex } = this.props;
    const { spoiler } = this.state;
    const spoilerClass = classNames({
      [classes.hideSpoiler]: !spoiler,
      [classes.spoiler]: true,
    });
    const spoilerTextClass = classNames({
      [classes.spoilerText]: !!spoiler,
    });
    return (
      <div style={{position: 'relative', height: '100%'}}>
        {this.props.spoiler && (
          <Paper className={spoilerClass} style={{zIndex: 100 - index - subindex}} onClick={this.onClick}>
            <Typography style={{margin: '64px'}} variant="title">{spoiler}</Typography>
          </Paper>
        )}
        <div className={spoilerTextClass}>
          {this.props.children || ''}
        </div>
      </div>
    );
  }
}

const StyledGuideSpoilerView = withStyles(GuideSpoilerViewStyle)(GuideSpoilerView);


const GuideViewStyles = (theme: Theme) => createStyles({
  fab: {
    position: 'fixed',
    bottom: '0',
    right: '0',
    margin: '32px',
    zIndex: 100,
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

type GuideStateType = null | "loading" | "success" | "error";

interface GuideViewProps extends RouteComponentProps<any>, WithStyles<typeof GuideViewStyles> {
  data?: null | types.GuideData;
}

interface GuideViewState {
  state: GuideStateType;
  data: types.GuideData;
  error: any;
  images: null | {
    images: types.GuideDataItemImage[];
    index: number;
  };
  spoiler: boolean;
}


class GuideView extends React.Component<types.UserStateStore & actions.UserStateProps & GuideViewProps, GuideViewState> {
  constructor(props: types.UserStateStore & actions.UserStateProps & GuideViewProps) {
    super(props);

    this.state = {
      state: null,
      data: null,
      error: null,
      images: null,
      spoiler: false,
    }
  }

  componentDidMount() {
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
        spoiler: !data.spoiler,
      })
      return;
    }

    this.setState({
      state: "loading",
      error: null,
    });

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
          spoiler: !data.spoiler,
        });
      })
      .catch((reason: any) => {
        this.setState({
          state: "error",
          error: null,
        });
      });
  };

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState);
  }

  setImages = (images: types.GuideDataItemImage[], index: number) => {
    this.setState({
      images: {
        images,
        index,
      }
    })
  };

  onImageDialogClose = () => {
    this.setState({
      images: null,
    });
  };

  onEditClick = () => {
    this.props.history.push(`/guides/${this.state.data._id}/edit`, this.state.data)
  }

  render() {
  	const { user, classes } = this.props;
    const { state, data, images } = this.state;

    if (state == null || state == "loading" || state == "error") {
      return (
        <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CircularProgress className={classes.progress} />
        </div>
      );
    }

	  return (
      <div style={{display: 'flex', flex: '1'}}>
        <StyledHeaderDrawer data={data}/>
        <Paper style={{display: 'flex', flex: '1', overflow: 'auto',}}>
          {user && user.user && user.user._id == data.author._id ? (
            <Button variant="fab" color="secondary" aria-label="Edit" className={classes.fab} onClick={this.onEditClick}>
              <EditIcon/>
            </Button>
          ) : ''}
          <div>
            <ImageDialog
              onClose={this.onImageDialogClose}
              index={images && images.index}
              images={images && images.images.map((image: types.GuideDataItemImage) => image.image)}
            />
        		<div className="guide">
            	<div className="guide-header">
                <div>
                  <Typography variant="display1" component="h1" style={{display: 'flex', alignItems: 'center', paddingTop: '20px'}}>
                    {data.class && <img style={{height: '30px', paddingRight: '8px'}} src={`/images/${data.class}_icon.png`}/>}
                    {data.title}
                  </Typography>
                  <span>by {data.author.username}</span>
                  <span> | </span>
                  <span>{distanceInWordsToNow(new Date(data.modified.toString() + 'Z'))} ago</span>
                </div>
              </div>
              <StyledGuideSpoilerView spoiler={data.spoiler} index={-1} subindex={0}>
                <div className="guide-items">
                  {data.items.map((item: types.GuideDataItem, index: number) => {
                    switch (item.type) {
                      case "header": {
                        return <GuideViewItemHeader key={index} item={item} index={index} subindex={0}/>
                      }
                      case "images": {
                        return <GuideViewItemImages key={index} item={item} index={index} subindex={0} onClickImages={this.setImages}/>
                      }
                      case "comment": {
                        return <GuideViewItemComment key={index} item={item} index={index} subindex={0}/>
                      }
                      case "group": {
                        return <GuideViewItemGroup key={index} item={item} index={index} onClickImages={this.setImages}/>
                      }
                    }
                  })}
                </div>
              </StyledGuideSpoilerView>
            </div>
          </div>
        </Paper>
      </div>
	  );
	}
}

const mapStateToProps = (state: types.UserStateStore, props: any): types.UserStateStore => ({
    user: state.user,
});

const mapDispatchToProps = (dispatch: Dispatch<actions.UserStateProps>): actions.UserStateProps => ({
  setUser: (value: null | types.UserState) => dispatch(actions.setUser(value)),
});

export default withRouter<any>(
  withStyles(GuideViewStyles, { withTheme: true })<any>(
    connect<types.UserStateStore, actions.UserStateProps, GuideViewProps>(mapStateToProps, mapDispatchToProps)(GuideView)
  )
);
