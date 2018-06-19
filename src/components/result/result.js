import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components';
import QrImage from './qrcode.jpg';

const resultText = {
  '偏瘦': '身体是革命的本钱',
  '正常': '虚心使人进步，骄傲使人落后',
  '偏重': '革命尚未成功，同志仍需努力',
  '肥胖': '要学会控制自己，做到有计划地增长'
}
const resultColor = {
  '偏瘦': 'gold',
  '正常': 'green',
  '偏重': 'darkorange',
  '肥胖': 'red'
}

export default class Result extends Component {

  constructor(props) {
    super(props);
    const { heightValue, weightValue, finalResult, nickName, avatarUrl } = props;
    this.state = {
      heightValue,
      weightValue,
      finalResult,
      nickName: nickName || '',
      avatarUrl: avatarUrl === '' ? QrImage : avatarUrl,
      weightStyle: 'color: black',
      status: '正常',
      advice: '',
      canvasShow: 'none',
      saveTime: 0
    };
  }

  componentWillMount () {}

  componentDidMount () {}

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  componentWillReceiveProps(nextProps) {
    const weightStyle =
      nextProps.finalResult <= 18.5
      ? 'color: Gold'
      : nextProps.finalResult > 18.5 && nextProps.finalResult <= 23.9
        ? 'color: green'
        : nextProps.finalResult > 23.9 && nextProps.finalResult <= 27.9
          ? 'color: DarkOrange'
          : 'color: red';
    const status =
      nextProps.finalResult <= 18.5
      ? '偏瘦'
      : nextProps.finalResult > 18.5 && nextProps.finalResult <= 23.9
        ? '正常'
        : nextProps.finalResult > 23.9 && nextProps.finalResult <= 27.9
          ? '偏重'
          : '肥胖';
    this.setState({
      finalResult: nextProps.finalResult,
      avatarUrl: nextProps.avatarUrl,
      nickName: nextProps.nickName,
      weightStyle,
      status
    });
  }
  // 画图片
  drawImage = () => {
    let getQrImg = new Promise((resolve, reject) => {
      /* 获得要在画布上绘制的图片 */
      Taro.getImageInfo({
        src: QrImage,
        success: (res) => {
          resolve(res);
        }
      })
    });
    getQrImg.then((res) => {
      const ctx = Taro.createCanvasContext('shareImg');
      const { windowHeight, windowWidth, pixelRatio } = Taro.getSystemInfoSync();
      const imgX = windowWidth * 0.04 + (windowWidth * 0.92 / 2) - 80;
      // 先绘制背景
      ctx.fillStyle = '#66cd00';
      ctx.rect(0 , 0, windowWidth, windowHeight);
      ctx.fill();
      ctx.save();
      // 绘制下面的卡片
      // 开始绘制第一张卡片
      this.drawRoundRect(ctx, windowWidth * 0.04, 60, windowWidth * 0.92, (windowHeight * 0.94 - 60)/2, 20);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.save();
      ctx.restore();
      // 绘制中间的分割线
      ctx.beginPath();
      this.drawDashLine(ctx, 20 + windowWidth * 0.04, (60 + (windowHeight * 0.94 - 60)/2), (windowWidth * 0.92) - 20 + windowWidth * 0.04, (60 + (windowHeight * 0.94 - 60)/2), 6);
      ctx.save();
      ctx.restore();
      // 绘制第二张卡片
      this.drawRoundRect(ctx, windowWidth * 0.04, (60 + (windowHeight * 0.94 - 60)/2), windowWidth * 0.92, (windowHeight * 0.94 - 60)/2, 20);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.save();
      ctx.restore();
      // 最后绘制图片，保证图片在最上方显示
      // 在中心绘制圆形图片，转换canvas坐标
      ctx.translate(imgX, 20);
      ctx.beginPath();
      // 绘制一个半径为90的圆，圆心就是0，因为中心已经过去了
      ctx.arc(80, 80, 80, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.strokeStyle = 'transparent';
      ctx.stroke();
      ctx.save();
      // clip()之前必须save
      ctx.clip(); //剪切路径
      ctx.drawImage('../../' + res.path, 0, 0, 160, 160);
      ctx.restore();
      // 绘制完将坐标移动回原点
      ctx.translate(-imgX, -20);
      // 绘制第一张卡片的文字
      this.drawFirstCardText(ctx, windowWidth, windowHeight);
      // 绘制第二张卡片的图形和文字
      // 绘制表格
      this.drawSecondCard(ctx, windowWidth, windowHeight);
      ctx.save();
      ctx.restore();
      // 绘制文字
      this.drawSecondCardText(ctx, windowWidth, windowHeight);
      ctx.save();
      ctx.restore();
      ctx.draw(false, setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'shareImg',
          width: windowWidth,
          height: windowHeight,
          destWidth: windowWidth * pixelRatio,
          destHeight: windowHeight * pixelRatio,
          success: (res) => {
            console.log(res.tempFilePath);
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: (result) => {
                Taro.showToast({
                  title: '已保存到相册'
                });
              }
            });
          }
        });
      }, 500));
    });
  }

  // 绘制第一张卡片文字
  drawFirstCardText = (ctx, windowWidth, windowHeight) => {
    const { pixelRatio } = Taro.getSystemInfoSync();
    const baseFontSize = windowHeight > 600 ? 16 : 10;
    const baseGap = windowHeight > 600 ? 9 * pixelRatio : 12;
    const firstStartHeight = 200;
    const firstCardWidth = windowWidth * 0.92 - 20;
    // 显示的文字和颜色
    const showText = resultText[this.state.status];
    const showColor = resultColor[this.state.status];
    // 微信名
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.font = (baseFontSize + 6) + 'rpx Arial bold';
    ctx.fillText(this.state.nickName, firstCardWidth / 2 + baseFontSize + windowWidth * 0.04, firstStartHeight + baseGap / 3);
    ctx.closePath();
    // 结果
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.fillStyle = showColor;
    ctx.font = baseFontSize * 1.5 + 'rpx Arial bold';
    ctx.fillText('您的体脂指数: ' + this.state.finalResult, firstCardWidth / 2 + baseFontSize  + windowWidth * 0.04, firstStartHeight + baseGap * 2);
    ctx.closePath();
    // 状态
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.fillStyle = showColor;
    ctx.font = baseFontSize * 1.5 + 'rpx Arial bold';
    ctx.fillText(this.state.status, firstCardWidth / 2 + baseFontSize  + windowWidth * 0.04, firstStartHeight + baseGap * 3.6);
    ctx.closePath();
    // 建议
    ctx.beginPath();
    ctx.fillStyle = '#444';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText(showText, firstCardWidth / 2 + baseFontSize  + windowWidth * 0.04, firstStartHeight + baseGap * 5);
    ctx.closePath();
  }
  // 绘制第二张卡片表格
  drawSecondCard = (ctx, windowWidth, windowHeight) => {
    const baseGap = windowHeight > 600 ? 40 : 30;
    const secondStartHeight = (60 + (windowHeight * 0.94 - 60)/2) + 35;
    const secondCardWidth = windowWidth * 0.92 - 20;
    ctx.beginPath();
    ctx.rect(10 + windowWidth * 0.04, secondStartHeight + 10, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'aqua';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10 + windowWidth * 0.04, secondStartHeight + 10 + baseGap * 1, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10 + windowWidth * 0.04, secondStartHeight + 10 + baseGap * 2, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10 + windowWidth * 0.04, secondStartHeight + 10 + baseGap * 3, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'darkorange';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10 + windowWidth * 0.04, secondStartHeight + 10 + baseGap * 4, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
  }
  // 绘制第二张卡片文字
  drawSecondCardText = (ctx, windowWidth, windowHeight) => {
    const baseFontSize = windowHeight > 600 ? 20 : 16;
    const baseGap = windowHeight > 600 ? 40 : 30;
    const secondStartHeight = (60 + (windowHeight * 0.94 - 60)/2) + 35;
    const secondCardWidth = windowWidth * 0.92 - 20;
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial bold';
    ctx.fillText('BMI中国标准', secondCardWidth / 2  + windowWidth * 0.04 + baseFontSize, secondStartHeight);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('分类', baseGap * 2 + windowWidth * 0.04, secondStartHeight + baseGap);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('BMI范围', secondCardWidth / 2 + baseGap + 20 + windowWidth * 0.04, secondStartHeight + baseGap);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('偏瘦', baseGap * 2 + windowWidth * 0.04, secondStartHeight + baseGap * 2);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('<= 18.5', secondCardWidth / 2 + baseGap + 20 + windowWidth * 0.04, secondStartHeight + baseGap * 2);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('正常', baseGap * 2 + windowWidth * 0.04, secondStartHeight + baseGap * 3);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('18.6 ~ 23.9', secondCardWidth / 2 + baseGap + 20 + windowWidth * 0.04, secondStartHeight + baseGap * 3);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('偏重', baseGap * 2 + windowWidth * 0.04, secondStartHeight + baseGap * 4);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText('24.0 ~ 27.9', secondCardWidth / 2 + baseGap + 20 + windowWidth * 0.04, secondStartHeight + baseGap * 4);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'px Arial';
    ctx.fillText('肥胖', baseGap * 2 + windowWidth * 0.04, secondStartHeight + baseGap * 5);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'px Arial';
    ctx.fillText('>= 28.0', secondCardWidth / 2 + baseGap + 20 + windowWidth * 0.04, secondStartHeight + baseGap * 5);
    ctx.closePath();
  }
  // 绘制卡片
  drawRoundRect = (cxt, x, y, width, height, radius) => {
    cxt.beginPath();
    cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    cxt.lineTo(width - radius + x, y);
    cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    cxt.lineTo(width + x, height + y - radius);
    cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    cxt.lineTo(radius + x, height +y);
    cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    cxt.closePath();
  }

  // 绘制虚线
  drawDashLine = (ctx, x1, y1, x2, y2, dashLength) => {
    var dashLen = dashLength === undefined ? 5 : dashLength,
    xpos = x2 - x1, //得到横向的宽度;
    ypos = y2 - y1, //得到纵向的高度;
    numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen);
    //利用正切获取斜边的长度除以虚线长度，得到要分为多少段;
    for(var i = 0; i < numDashes; i++){
        if(i % 2 === 0){
            ctx.moveTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i);
            //有了横向宽度和多少段，得出每一段是多长，起点 + 每段长度 * i = 要绘制的起点；
        }else{
            ctx.lineTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i);
        }
      }
    ctx.strokeStyle = '#444';
    ctx.stroke();
  }


  closeResult = () => {
    this.props.hideResult();
  }

  saveImage = (e) => {
    this.drawImage();
  }

  render () {
    const { windowHeight, windowWidth, pixelRatio } = Taro.getSystemInfoSync();
    const marginTop = Number(windowHeight) > 700 ? 240 : 150;
    const topCard = 'margin-top: ' + marginTop + 'rpx;min-height: 200px;margin-bottom: 0; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; border-bottom: 1px ridge #fff';
    const bottomCard = 'margin-top: 0; border-top-right-radius: 20px; border-top-left-radius: 20px; border-top: 1px ridge #fff';
    const resultStyle = 'display:' + this.props.resultShow;
    const canvasStyle = 'width:' + windowWidth + ';height:' + windowHeight;
    return (
      <View className='result-bg' style={resultStyle}>
        <canvas
          canvas-id="shareImg"
          className='canvas-style'
          width={(windowWidth * 2).toString()}
          height={(windowHeight * 2).toString()}
          style={canvasStyle}
        ></canvas>
        <div className='result-card' style={topCard}>
          <div className='logo-container'>
            <Image
              className='zhou-logo'
              src={this.state.avatarUrl}
            />
          </div>
          <div className='result-content'>
            <Text className='result-title' style={this.state.weightStyle}>
              <Text className='nick-name'>{this.state.nickName}</Text>
              <Text style='color: black;font-size: 40rpx; margin-right: 10rpx'>您的体脂指数为: </Text> {this.state.finalResult}
              <Text style='font-size: 50rpx;'>{this.state.status}</Text>
            </Text>
            <Text className='advice-style'>{resultText[this.state.status]}</Text>
          </div>
        </div>
        <div className='result-card' style={bottomCard}>
          <Text className='card-title'>BMI中国标准</Text>
          <div className='card-table'>
            <div className='table-row' style='background: aqua'>
              <div className='table-item'>分类</div>
              <div className='table-item'>BMI范围</div>
            </div>
          </div>
          <div className='card-table'>
            <div className='table-row' style='background: gold'>
              <div className='table-item'>偏瘦</div>
              <div className='table-item'>≤ 18.5</div>
            </div>
          </div>
          <div className='card-table'>
            <div className='table-row' style='background: green'>
              <div className='table-item'>正常</div>
              <div className='table-item'>18.6 ~ 23.9</div>
            </div>
          </div>
          <div className='card-table'>
            <div className='table-row' style='background: darkorange'>
              <div className='table-item'>偏重</div>
              <div className='table-item'>24.0 ~ 27.9</div>
            </div>
          </div>
          <div className='card-table'>
            <div className='table-row' style='background: red'>
              <div className='table-item'>肥胖</div>
              <div className='table-item'>≥ 28.0</div>
            </div>
          </div>
          <View className='close-result'>
            <Button
              size='mini'
              type='primary'
              onClick={this.closeResult}
              plain
              style='margin: auto 0'
            >重新计算</Button>
            <span style='color: #666'>|</span>
            <View
              className='save-img-text'
              onLongPress={this.saveImage}
            >长按保存图片</View>
          </View>
        </div>
      </View>
    )
  }
}

