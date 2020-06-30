import React, {Component} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  // Animated,
} from 'react-native';

import Animated, {interpolate} from 'react-native-reanimated';
import {onScrollEvent} from 'react-native-redash';

const screen = Dimensions.get('window');
// const ScrollViewPropTypes = ScrollView.propTypes;

export default class ParallaxView extends Component {
  constructor(props) {
    super(props);
    this.scrollY = new Animated.Value(0);
  }

  // getScrollResponder() {
  //   return this._scrollView.getScrollResponder();
  // }

  // setNativeProps(props) {
  //   this._scrollView.setNativeProps(props);
  // }

  renderBackground() {
    const {windowHeight, headerHeight, backgroundSource, backgroundStyle, miniBlur, maxBlur, animatedScrollValue} = this.props;
    if (!windowHeight || !backgroundSource) {
      return null;
    }

    return (
      <Animated.Image
        style={[
          getAnimateViewStyle(animatedScrollValue || this.scrollY, windowHeight, headerHeight).background,
          backgroundStyle,
          {backgroundColor: 'red',height: windowHeight, width: '100%'}
        ]}
        blurRadius={getImageBlur(animatedScrollValue || this.scrollY, miniBlur || 0, maxBlur || 0)}
        source={backgroundSource}
      />
    );
  }

  renderHeader() {
    const {windowHeight, headerHeight, backgroundSource, headerStyle, animatedScrollValue} = this.props;
    if (!windowHeight || !backgroundSource) {
      return null;
    }
    return (
      <Animated.View
        style={[
          getAnimateViewStyle(animatedScrollValue || this.scrollY, windowHeight, headerHeight).header,
          headerStyle,
        ]}>
        {this.props.header}
      </Animated.View>
    );
  }

  renderFixedHeader() {
    const {renderFixedHeader, headerHeight, animatedScrollValue} = this.props;
    if (!renderFixedHeader) return null;
    return (
      <View style={{zIndex: 2, width: '100%', height: headerHeight}}>
        {renderFixedHeader(animatedScrollValue || this.scrollY)}
      </View>
    )
  }

  onScrollEndDrag(e) {
    if(this.props.onScrollEndDrag) {
      this.props.onScrollEndDrag(e);
    }
    this._scrollView.scrollTo({y: 0});
  }

  render() {
    const {style, animatedScrollValue, scrollRef} = this.props;
    return (
      <View style={[styles.container, style]}>
        {this.renderFixedHeader()}
        {this.renderBackground()}
        <Animated.ScrollView
          // ref={component => {
          //   this._scrollView = component;
          // }}
          {...this.props}
          ref={scrollRef}
          style={styles.scrollView}
          onScroll={onScrollEvent({y: animatedScrollValue || this.scrollY})
            }
          // onScrollEndDrag={(e) => {this.onScrollEndDrag(e)}}
          scrollEventThrottle={1}
          >
            {this.renderHeader()}
            {this.props.children}
        </Animated.ScrollView>
      </View>
    );
  }
}

// ParallaxView.propTypes = {
//   ...ScrollViewPropTypes,
//   windowHeight: PropTypes.number,
//   backgroundStyle: PropTypes.object,
//   refreshControl: PropTypes.object,
//   backgroundSource: PropTypes.oneOfType([
//     PropTypes.shape({
//       uri: PropTypes.string,
//     }),
//     PropTypes.number,
//   ]),
//   header: PropTypes.node,
//   contentInset: PropTypes.object,
// };

ParallaxView.defaultProps = {
  windowHeight: 300,
  headerHeight: 0,
  contentInset: {top: screen.scale},
};

const getAnimateViewStyle = (scrollY, windowHeight, headerHeight) => {
  return {
    header: {
      position: 'relative',
      height: windowHeight - headerHeight,
      opacity: interpolate(scrollY, {
        inputRange: [-windowHeight, 0, windowHeight / 1.2],
        outputRange: [1, 1, 0],
      }),
    },
    background: {
      position: 'absolute',
      transform: [
        {
          translateY: interpolate(scrollY, {
            inputRange: [-windowHeight, 0, windowHeight],
            outputRange: [windowHeight / 2, 0, -windowHeight / 2],
          }),
        },
        {
          scale: interpolate(scrollY, {
            inputRange: [-windowHeight, 0, windowHeight],
            outputRange: [2, 1, 1],
          }),
        },
      ],
    },
  };
};

const getImageBlur = (scrollY, miniBlur, maxBlur) => {
  return interpolate(scrollY, {
    inputRange: [-miniBlur, 0, maxBlur],
    outputRange: [miniBlur, 0, -maxBlur],
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    position: 'absolute',
    backgroundColor: '#2e2f31',
    width: screen.width,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
});

