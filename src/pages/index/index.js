import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import Result from '../../components/result/result';
import './index.scss';
import shareImage from './shareImage.png';


export default class Index extends Component {

  constructor(props) {
    super(props);
    this.state = {
      heightValue: '',
      weightValue: '',
      errorShow: 'none',
      resultShow: 'none',
      finalResult: 0,
      avatarUrl: '',
      nickName: ''
    };
  }

  config = {
    navigationBarTitleText: 'BMI体脂计算器'
  }

  componentWillMount () { }

  componentDidMount () {}

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  // 设置分享
  onShareAppMessage = (res) => {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '您有一份体质健康数据，请查收！',
      path: '/pages/index/index'
    }
  }


  heightValueChange = (e) => {
    const heightValue = e.target.value;
    this.setState({ heightValue });
  }

  weightValueChange = (e) => {
    const weightValue = e.target.value;
    this.setState({ weightValue });
  }

  calculatorFat = () => {
    wx.getUserInfo({
      success: (res) => {
        const { userInfo } = res;
        const { avatarUrl, nickName } = userInfo;
        this.setState({ avatarUrl, nickName }, () => {
          const { heightValue, weightValue } = this.state;
          if (heightValue !== 0 && weightValue !== 0) {
            if (Number(heightValue) < 0 || Number(heightValue) > 2.5) {
              Taro.showModal({
                title: '身高确认？',
                content: '身高单位为米，请确认您的身高数据正确！',
                success: (res) => {
                  if (res.confirm) {
                    // 身高正确，进行计算
                    const finalResult = Number(weightValue) / (Number(heightValue) * Number(heightValue));
                    this.setState({ resultShow: 'block', finalResult: finalResult.toFixed(1) });
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            } else {
              // 身高正确，进行计算
              const finalResult = Number(weightValue) / (Number(heightValue) * Number(heightValue));
              this.setState({ resultShow: 'block', finalResult: finalResult.toFixed(1) });
            }
          } else {
            this.setState({ errorShow: 'flex' }, () => {
              setTimeout(() => {
                this.setState({ errorShow: 'none' });
              }, 1800);
            })
          }
        });
      },
      fail: (res) => {
        const { heightValue, weightValue } = this.state;
        if (heightValue !== 0 && weightValue !== 0) {
          if (Number(heightValue) < 0 || Number(heightValue) > 2.5) {
            Taro.showModal({
              title: '身高确认？',
              content: '身高单位为米，请确认您的身高数据正确！',
              success: (res) => {
                if (res.confirm) {
                  // 身高正确，进行计算
                  const finalResult = Number(weightValue) / (Number(heightValue) * Number(heightValue));
                  this.setState({ resultShow: 'block', finalResult: finalResult.toFixed(1) });
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          } else {
            // 身高正确，进行计算
            const finalResult = Number(weightValue) / (Number(heightValue) * Number(heightValue));
            this.setState({ resultShow: 'block', finalResult: finalResult.toFixed(1) });
          }
        } else {
          this.setState({ errorShow: 'flex' }, () => {
            setTimeout(() => {
              this.setState({ errorShow: 'none' });
            }, 1800);
          })
        }
      }
    })
  }

  hideResult = () => {
    this.setState({ resultShow: 'none', weightValue: '', heightValue: '' });
  }

  render () {
    const errorStyle = 'display:' + this.state.errorShow;
    const resultStyle = 'display:' + this.state.resultShow;
    return (
      <div>
        <Result
          heightValue={this.state.heightValue}
          weightValue={this.state.weightValue}
          hideResult={this.hideResult}
          resultShow={this.state.resultShow}
          finalResult={this.state.finalResult}
          avatarUrl={this.state.avatarUrl}
          nickName={this.state.nickName}
        />
        <div className='index-bg'>
          <div className='errorHint' style={errorStyle}>
            <Icon size='40' type='warn' color='#fff' />
            <Text className='errorText'>请输入正确的身高体重！</Text>
          </div>
          <View className='index'>
            <div className='index-card'>
              <Text className='defination'>
                体重指数：目前常用的体重指数（body mass index）简称BMI，又译为体质指数。
              </Text>
              <Text className='pattern'>
                BMI = 体重(kg) ÷ 身高²(m)
              </Text>
              <Text className='attention'>男性腰围 ≥ 85cm, 女性腰围 ≥ 80cm 为腹型肥胖！</Text>
              <Text className='originArticle'>《中国成人超重及肥胖指南》</Text>
            </div>
            <div className='index-card'>
              <View className='form-container'>
                <Text className='form-label'>身高: </Text>
                <Input
                  className='form-input'
                  type='digit'
                  value={this.state.heightValue}
                  placeholder='请输入您的身高'
                  placeholderClass='form-placeholder'
                  onChange={this.heightValueChange}
                />
                <Text className='form-addons'>单位:米/m</Text>
              </View>
              <View className='form-container'>
                <Text className='form-label'>体重: </Text>
                <Input
                  className='form-input'
                  type='digit'
                  value={this.state.weightValue}
                  placeholder='请输入您的体重'
                  placeholderClass='form-placeholder'
                  onChange={this.weightValueChange}
                />
                <Text className='form-addons'>单位:千克/kg</Text>
              </View>
              <View className='form-container'>
                <Text className='form-label'>BMI标准: </Text>
                <Text className='form-addons'>暂时只支持中国标准</Text>
              </View>
              <View className='form-container'>
                <Button
                  size='mini'
                  className='form-button'
                  type='primary'
                  plain
                  onClick={this.calculatorFat}
                  openType='getUserInfo'
                >计算</Button>
              </View>
            </div>
            <div className='index-footer'>
              <Text className='author'>@内分泌小周大夫</Text>
            </div>
          </View>
        </div>
      </div>
    )
  }
}

