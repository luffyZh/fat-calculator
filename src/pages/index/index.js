import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import Result from '../../components/result/result';
import './index.scss';

export default class Index extends Component {

  constructor(props) {
    super(props);
    this.state = {
      heightValue: 0,
      weightValue: 0,
      errorShow: 'none',
      resultShow: 'none',
      finalResult: 0,
    };
  }

  config = {
    navigationBarTitleText: 'BMI体脂计算器'
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  heightValueChange = (e) => {
    const heightValue = e.target.value;
    this.setState({ heightValue });
  }

  weightValueChange = (e) => {
    const weightValue = e.target.value;
    this.setState({ weightValue });
  }

  calculatorFat = () => {
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
              this.setState({ resultShow: 'block', finalResult });
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

  hideResult = () => {
    this.setState({ resultShow: 'none' });
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
        />
        <div className='index-bg'>
          <div className='errorHint' style={errorStyle}>
            <Icon size='40' type='warn' color='#fff' />
            <Text className='errorText'>请输入正确的身高体重！</Text>
          </div>
          <View className='index'>
            <div className='index-card'>
              <Text className='defination'>
                体重指数：目前常用的体重指数（body mass index）简称BMI，又译为体脂指数。
              </Text>
              <Text className='pattern'>
                BMI = 身高 / 体重²
              </Text>
              <Text className='attention'>** : 男性腰围 > 85, 女性腰围 > 60 为腹型肥胖！</Text>
              <Text className='originArticle'>《中国成人超重及肥胖指南》</Text>
            </div>
            <div className='index-card'>
              <View className='form-container'>
                <Text className='form-label'>身高: </Text>
                <Input
                  className='form-input'
                  type='digit'
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

