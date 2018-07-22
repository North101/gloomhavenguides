import * as React from 'react';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import GuideImage from './guide_image'

const styles = createStyles({
  root: {
    width: '100%',
    height: '100%',
  }
});

interface ImageDialogProps extends WithStyles<typeof styles> {
  onClose: () => void;
  images?: string[];
  index?: number;
}

interface ImageDialogState {
  index: number;
}

class ImageDialog extends React.Component<ImageDialogProps, ImageDialogState> {
  constructor(props: ImageDialogProps) {
    super(props);

    this.state = {
      index: this.props.index || 0,
    }
  }

  componentWillReceiveProps(props: ImageDialogProps) {
    this.setState({
      index: props.index || 0,
    });
  }

  handleClose = () => {
    this.props.onClose();
  };

  onBackClick = () => {
    const index = this.state.index;
    this.setState({ index: index <= 0 ? this.props.images.length - 1 : index - 1 });
  };

  onForwardClick = () => {
    const index = this.state.index;
    this.setState({ index: index >= this.props.images.length - 1 ? 0 : index + 1 });
  }

  render() {
    if (!this.props.images) return '';

    return (
      <Dialog
        open={!!this.props.images}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <GuideImage onClick={this.onForwardClick} image={this.props.images[this.state.index]}/>
      </Dialog>
    );
  }
}

export default withStyles(styles)(ImageDialog);
