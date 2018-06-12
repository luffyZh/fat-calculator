import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Picker, Image } from '@tarojs/components';
import './index.scss';

export default class Index extends Component {

  constructor(props) {
    super(props);
    this.state = {modalShow: false};
  }

  config = {
    navigationBarTitleText: '体脂计算器BMI'
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  calculatorFat = () => {
    this.setState({ modalShow: true });
  }

  render () {
    return (
      <div className='index-bg'>
        <View className='index'>
          <Text className='index-title'>小周大夫详解您的身体质量指数(BMI)</Text>
          <div className='index-card'>
            <div className='form-container'>
              <Text className='form-label'>身高: </Text>
              <Input
                className='form-input'
                type='digit'
                placeholder='请输入您的身高'
                placeholderClass='form-placeholder'
              />
              <Text className='form-addons'>单位:厘米/cm</Text>
            </div>
            <div className='form-container'>
              <Text className='form-label'>体重: </Text>
              <Input
                className='form-input'
                type='digit'
                placeholder='请输入您的体重'
                placeholderClass='form-placeholder'
              />
              <Text className='form-addons'>单位:千克/kg</Text>
            </div>
            <div className='form-container'>
              <Text className='form-label'>BMI标准: </Text>
              <Text className='form-addons'>暂时只支持中国标准</Text>
            </div>
            <div className='form-container'>
              <Button
                size='mini'
                className='form-button'
                type='primary'
                plain
                onClick={this.calculatorFat}
              >计算</Button>
            </div>
          </div>
          <div className='index-card'>
            <Text className='card-title'>BMI中国标准</Text>
            <div className='card-table'>
              <div className='table-row' style='background: aqua'>
                <div className='table-item'>分类</div>
                <div className='table-item'>BMI范围</div>
              </div>
            </div>
            <div className='card-table'>
              <div className='table-row' style='background: yellow'>
                <div className='table-item'>偏瘦</div>
                <div className='table-item'>≤ 18.4</div>
              </div>
            </div>
            <div className='card-table'>
              <div className='table-row' style='background: green'>
                <div className='table-item'>正常</div>
                <div className='table-item'>18.5 ~ 23.9</div>
              </div>
            </div>
            <div className='card-table'>
              <div className='table-row' style='background: orange'>
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
          </div>
        </View>
      </div>
    )
  }
}

