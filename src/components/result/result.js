import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components';
import QrImage from './qrcode.jpg';

const resultText = {
  '偏瘦': '一日三餐按时吃，弱不禁风就不好了！',
  '正常': '完美身材，继续保持哦！',
  '偏重': '多吃蔬菜少吃肉，适当进行运动！',
  '肥胖': '为了您和家人，需要考虑减肥了哦！'
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
    const { heightValue, weightValue, finalResult } = props;
    this.state = { 
      heightValue,
      weightValue,
      finalResult,
      weightStyle: 'color: black',
      status: '正常',
      advice: '',
      canvasShow: 'none',
      saveTime: 0
    };
  }

  componentWillMount () {}

  componentDidMount () {
    
  }

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
    this.setState({ finalResult: nextProps.finalResult, weightStyle, status });
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
      const imgX = (windowWidth * 0.92 / 2) - 90;
      // 先绘制下面的卡片
      // 开始绘制第一张卡片
      this.drawRoundRect(ctx, 0, 60, windowWidth * 0.92, (windowHeight * 0.94 - 60)/2, 20);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.save();
      ctx.restore();
      // 绘制中间的分割线
      ctx.beginPath();
      this.drawDashLine(ctx, 20, (60 + (windowHeight * 0.94 - 60)/2), (windowWidth * 0.92) - 20, (60 + (windowHeight * 0.94 - 60)/2), 6);
      ctx.save();
      ctx.restore();
      // 绘制第二张卡片
      this.drawRoundRect(ctx, 0, (60 + (windowHeight * 0.94 - 60)/2), windowWidth * 0.92, (windowHeight * 0.94 - 60)/2, 20);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.save();
      ctx.restore();
      // 最后绘制图片，保证图片在最上方显示
      // 在中心绘制圆形图片，转换canvas坐标
      ctx.translate(imgX, 0);
      ctx.beginPath();
      // 绘制一个半径为90的圆，圆心就是0，因为中心已经过去了
      ctx.arc(90, 90, 90, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.strokeStyle = 'transparent';
      ctx.stroke();
      ctx.save();
      // clip()之前必须save
      ctx.clip(); //剪切路径
      ctx.drawImage('../../' + res.path, 0, 0, 180, 180);
      ctx.restore();
      // 绘制完将坐标移动回原点
      ctx.translate(-imgX, 0);
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
    const baseFontSize = windowHeight > 600 ? 20 : 16;
    const baseGap = windowHeight > 600 ? 20 : 10;
    const firstStartHeight = 200;
    const firstCardWidth = windowWidth * 0.92 - 20;
    // 显示的文字和颜色
    const showText = resultText[this.state.status];
    const showColor = resultColor[this.state.status];
    // 结果
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.fillStyle = showColor;
    ctx.font = baseFontSize * 1.5 + 'rpx Arial bold';
    ctx.fillText(this.state.finalResult, firstCardWidth / 2 + baseFontSize/2, firstStartHeight + baseGap / 2);
    ctx.closePath();
    // 状态
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.fillStyle = showColor;
    ctx.font = baseFontSize * 1.5 + 'rpx Arial bold';
    ctx.fillText(this.state.status, firstCardWidth / 2 + baseFontSize/2, firstStartHeight + baseGap * 3);
    ctx.closePath();
    // 建议
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = baseFontSize + 'rpx Arial';
    ctx.fillText(showText, firstCardWidth / 2 + baseFontSize/2, firstStartHeight + baseGap * 5);
    ctx.closePath();
  }
  // 绘制第二张卡片表格
  drawSecondCard = (ctx, windowWidth, windowHeight) => {
    const baseGap = windowHeight > 600 ? 40 : 30;
    const secondStartHeight = (60 + (windowHeight * 0.94 - 60)/2) + 35;
    const secondCardWidth = windowWidth * 0.92 - 20;
    ctx.beginPath();
    ctx.rect(10, secondStartHeight + 10, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'aqua';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10, secondStartHeight + 10 + baseGap * 1, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10, secondStartHeight + 10 + baseGap * 2, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10, secondStartHeight + 10 + baseGap * 3, secondCardWidth, baseGap);
    ctx.closePath();
    ctx.fillStyle = 'darkorange';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(10, secondStartHeight + 10 + baseGap * 4, secondCardWidth, baseGap);
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
    ctx.fillText('BMI中国标准', secondCardWidth / 2, secondStartHeight);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('分类', baseGap * 2, secondStartHeight + baseGap);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('BMI范围', secondCardWidth / 2 + baseGap + 20, secondStartHeight + baseGap);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('偏瘦', baseGap * 2, secondStartHeight + baseGap * 2);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('<= 18.5', secondCardWidth / 2 + baseGap + 20, secondStartHeight + baseGap * 2);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('正常', baseGap * 2, secondStartHeight + baseGap * 3);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('18.6 ~ 23.9', secondCardWidth / 2 + baseGap + 20, secondStartHeight + baseGap * 3);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('偏重', baseGap * 2, secondStartHeight + baseGap * 4);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'rpx Arial bolder';
    ctx.fillText('24.0 ~ 27.9', secondCardWidth / 2 + baseGap + 20, secondStartHeight + baseGap * 4);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'px Arial bolder';
    ctx.fillText('肥胖', baseGap * 2, secondStartHeight + baseGap * 5);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.font = baseFontSize + 'px Arial bolder';
    ctx.fillText('>= 28.0', secondCardWidth / 2 + baseGap + 20, secondStartHeight + baseGap * 5);
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
    for(var i=0; i<numDashes; i++){
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
    this.setState({ canvasShow: 'block' }, () => {
      this.drawImage();
    });
  }

  render () {
    const topCard = 'margin-top: 100px;min-height: 200px;margin-bottom: 0; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; border-bottom: 1px ridge #fff';
    const bottomCard = 'margin-top: 0; border-top-right-radius: 20px; border-top-left-radius: 20px; border-top: 1px ridge #fff';
    const resultStyle = 'display:' + this.props.resultShow;
    const canvasStyle = 'opacity: 0;display:' + this.state.canvasShow;
    return (
      <View className='result-bg' style={resultStyle}>
        <View className='canvas-bg' style={canvasStyle}>
          <canvas canvas-id="shareImg" className='canvas-style'></canvas>
        </View>
        <View id='resultContainer' onLongPress={this.saveImage}>
          <div className='result-card' style={topCard}>
            <div className='logo-container'>
              <Image
                className='zhou-logo'
                src='https://mmbiz.qpic.cn/mmbiz_jpg/EZxuE6YEtzTtAic77ukdGViaUjliaoSicdzOauHFJym6P67Gm5FTMHOLGYw87YI9j7nGR7g8wWdicb85jt3R7j340pg/0?wx_fmt=jpeg'
              />
            </div>
            <div className='result-content'>
              <Text className='result-title' style={this.state.weightStyle}>
                <Text style='color: black;font-size: 40rpx; margin-right: 10rpx'>您的体脂指数为: </Text> {this.state.finalResult}
                <Text style='font-size: 50rpx;'>{this.state.status}</Text>
              </Text>
              <Text className='advice-style'>[小周大夫建议]:{resultText[this.state.status]}</Text>
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
                onClick={this.saveImage}
              >保存图片</View>
            </View>
          </div>
        </View>
      </View>
    )
  }
}

