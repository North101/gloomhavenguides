import * as React from 'react';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';


const GuideImageStyles = createStyles({
  img: {
    objectFit: 'contain',
    height: '100%',
    width: '100%',
  },
});

interface GuideImageProps extends WithStyles<typeof GuideImageStyles> {
  image: string;
  onClick?: () => void;
}

interface GuideImageState {}

class GuideImage extends React.Component<GuideImageProps, GuideImageState> {
  render() {
    return <img
      className={this.props.classes.img}
      onClick={this.props.onClick}
      src={`/images/${this.props.image}.jpg`}
    />
  }
}

export default withStyles(GuideImageStyles)(GuideImage);