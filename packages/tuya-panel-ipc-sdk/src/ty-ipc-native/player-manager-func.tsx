/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
import { Platform } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import CameraManager from './nativeApi';
import Strings from '../ty-ipc-player/i18n';
import {
  connecP2PAndStartPreview,
  exitPlayPreview,
  connecP2PAndStartPreviewWithChannel,
  exitPlayPreviewByAudioOrOther,
} from './nativeManager';
import { decodeClarityDic } from './cameraData';

const isIOS = Platform.OS === 'ios';

const TYEvent = TYSdk.event;

type clarityDic = 'SS' | 'SD' | 'HD' | 'UD' | 'SSP' | 'AUDIO';

class PlayerManagerFun {
  /*
    播放视频
    @param
    isWirless: 是否为低功耗产品
    isShare: 是否为分享的设备
  */

  startPlay = (
    isWirless: boolean,
    privateMode: boolean,
    deviceOnline: boolean,
    clarityStatus: string,
    voiceStatus: string,
    hightScaleMode: boolean,
    channelNum: number
  ) => {
    /* 返回状态进行定义
       status:  0: 设备离线 1: 隐私模式 2: 正在连接P2P通道 3: 通道构建失败 4: 正在获取视频流 5: 获取视频流失败 6: 正常播放 7.音频模式ei
    */
    if (!deviceOnline) {
      TYEvent.emit('streamStatus', { status: 0 });
      return false;
    }
    if (privateMode) {
      exitPlayPreview(true);
      TYEvent.emit('streamStatus', { status: 1 });
      return false;
    }
    channelNum === -1 &&
      connecP2PAndStartPreview(isWirless, clarityStatus, voiceStatus, hightScaleMode);
    channelNum !== -1 &&
      connecP2PAndStartPreviewWithChannel(
        isWirless,
        clarityStatus,
        voiceStatus,
        hightScaleMode,
        channelNum
      );
  };

  /*
    停止预览
    @param
  */
  pausePlay = () => {
    console.log('停止播放');
  };

  /*
    高标清视频流切换
    @param
  */
  enableHd = (clarityStatus: 'HD' | 'SD') => {
    return new Promise((resolve, reject) => {
      CameraManager.enableHd(
        clarityStatus === 'HD',
        () => {
          resolve({
            success: true,
          });
        },
        err => {
          resolve({
            success: false,
            errMsg: JSON.stringify(err),
          });
        }
      );
    });
  };

  /*
    声音切换
    @param
  */
  enableMute = (voiceStatus: 'OFF' | 'ON') => {
    return new Promise((resolve, reject) => {
      CameraManager.enableMute(
        voiceStatus === 'OFF',
        () => {
          resolve({
            success: true,
          });
        },
        err => {
          resolve({
            success: false,
            errMsg: JSON.stringify(err),
          });
        }
      );
    });
  };

  /*
  拍照
  @param
  */
  snapShoot = () => {
    return new Promise((resolve, reject) => {
      if (isIOS) {
        try {
          CameraManager.snapShootToAlbum(
            msg => {
              TYEvent.emit('cutScreenListen', {
                showCutScreen: true,
                isVideoCut: false,
                imageSrc: msg,
              });
              resolve({
                success: true,
                imageSrc: msg,
              });
            },
            err => {
              resolve({
                success: false,
                errMsg: JSON.stringify(err),
              });
            }
          );
        } catch (err) {
          CameraManager.showTip('请升级使用3.17及以上版本App开发');
        }
      } else {
        CameraManager.snapShoot(
          msg => {
            TYEvent.emit('cutScreenListen', {
              showCutScreen: true,
              isVideoCut: false,
              imageSrc: msg,
            });
            resolve({
              success: true,
              imageSrc: msg,
            });
          },
          err => {
            resolve({
              success: false,
              errMsg: JSON.stringify(err),
            });
          }
        );
      }
    });
  };

  /*
    原生弹泡框
    @param
  */
  showToast = (str: string) => {
    CameraManager.showTip(str);
  };

  /*
    跳转通用相册
    3.17及以上
    @param
  */
  enterAlbum = () => {
    if (!isIOS) {
      CameraManager.photos();
    } else {
      CameraManager.gotoPhotoLibrary();
    }
  };

  /*
    跳转通用主题色相册
    3.20及以上
    @param
    theme: 1: 黑色 2：白色
    默认是白色
  */
  enterParamAlbum = (param: { theme: number; [propName: string]: any }) => {
    CameraManager.gotoCameraAlbumPanelWithParams(param);
  };

  /*
    跳转设备本地相册(适用于行车记录仪)
    3.22及以上
    @param
    theme: 1: 黑色 2：白色
    默认是白色
  */
  enterDeviceParamAlbum = (param: { [propName: string]: any }) => {
    try {
      CameraManager.gotoCameraDevicePhotoLibraryWithParams(param);
    } catch (err) {
      CameraManager.showTip(Strings.getLang('tyIpc_method_not_supported_version'));
    }
  };

  /*
    录像开始与结束
    3.17及以上
    @param
  */
  enableRecord = () => {
    return new Promise((resolve, reject) => {
      CameraManager.isRecording(msg => {
        if (msg) {
          CameraManager.stopRecord(
            imgSource => {
              TYEvent.emit('cutScreenListen', {
                showCutScreen: true,
                isVideoCut: true,
                imageSrc: imgSource,
              });
              resolve({
                success: true,
              });
              TYEvent.emit('isRecordingListen', {
                isRecording: false,
              });
            },
            err => {
              resolve({
                success: false,
                isSaveErr: true,
                errMsg: JSON.stringify(err),
              });
              TYEvent.emit('isRecordingListen', {
                isRecording: false,
              });
            }
          );
        } else if (isIOS) {
          CameraManager.startRecordToAlbum(
            () => {
              resolve({
                success: true,
                isRecording: true,
              });
              TYEvent.emit('isRecordingListen', {
                isRecording: true,
              });
            },
            err => {
              resolve({
                success: false,
                isSaveErr: false,
                errMsg: JSON.stringify(err),
              });
              TYEvent.emit('isRecordingListen', {
                isRecording: false,
              });
            }
          );
        } else {
          CameraManager.startRecord(
            () => {
              resolve({
                success: true,
                isRecording: true,
              });
              TYEvent.emit('isRecordingListen', {
                isRecording: true,
              });
            },
            err => {
              resolve({
                success: false,
                isSaveErr: false,
                errMsg: JSON.stringify(err),
              });
              TYEvent.emit('isRecordingListen', {
                isRecording: true,
              });
            }
          );
        }
      });
    });
  };

  /*
    开启对讲
    @param
  */
  enableStartTalk = (isTwoTalk: boolean) => {
    CameraManager.enableMute(
      !isTwoTalk,
      () => {
        TYEvent.emit('talkingChangeMute', { voiceStatus: isTwoTalk === true ? 'ON' : 'OFF' });
      },
      () => {
        CameraManager.showTip(Strings.getLang('operatorFailed'));
      }
    );
    CameraManager.startTalk(
      () => {
        TYEvent.emit('isTalkingListen', { isTalking: true });
      },
      () => {
        TYEvent.emit('isTalkingListen', { isTalking: false });
        CameraManager.showTip(Strings.getLang('operatorFailed'));
      }
    );
  };

  /*
    结束对讲
    @param
    是否为双向对讲
  */
  enableStopTalk = (isTwoTalk: boolean) => {
    !isTwoTalk &&
      CameraManager.enableMute(
        isTwoTalk,
        () => {
          TYEvent.emit('talkingChangeMute', { voiceStatus: !isTwoTalk ? 'ON' : 'OFF' });
        },
        () => {
          CameraManager.showTip(Strings.getLang('operatorFailed'));
        }
      );
    CameraManager.stopTalk(
      () => {
        TYEvent.emit('isTalkingListen', { isTalking: false });
      },
      () => {
        TYEvent.emit('isTalkingListen', { isTalking: false });
        CameraManager.showTip(Strings.getLang('operatorFailed'));
      }
    );
  };

  enterPlayBack = () => {
    TYEvent.emit('changeCameraAction', { action: 1, nativePage: 1 });
    CameraManager.gotoCameraNewPlaybackPanel();
  };

  /*
    进入主题回放及跳转至固定时间回放
    3.20及以上
    theme: 主题色 黑色为1 白色为2
    time:  播放的时间戳, 单位秒
    @param
  */
  enterParamPlayBack = (param: { theme?: 1 | 2; time?: number; [propName: string]: any }) => {
    TYEvent.emit('changeCameraAction', { action: 1, nativePage: 1 });
    CameraManager.gotoCameraNewPlaybackPanelWithParams(param);
  };

  /*
    进入原生云存储
    3.17及以上
    @param
  */
  enterCloudBack = () => {
    // action: 0 直播初始化 1 直播进入回放 2 回放进入直播 4 直播进入设置 5 设置返回直播
    // nativePage: 0 首页 1 进入回放 2进入云存 4 进入其它原生有视频播放器的界面(设置) 5.从进入其它原生有视频播放器的界面返回至视频首页
    TYEvent.emit('changeCameraAction', { action: 0, nativePage: 2 });
    CameraManager.gotoCloudStoragePanel();
  };

  /*
    进入主题回放及跳转至固定时间回放
    3.20及以上
    theme: 主题色 黑色为1 白色为2
    time:  播放的时间戳, 单位秒
    @param
  */
  enterParamCloudBack = (param: { theme?: 1 | 2; time?: number; [propName: string]: any }) => {
    TYEvent.emit('changeCameraAction', { action: 0, nativePage: 2 });
    CameraManager.gotoCloudStoragePanelWithParams(param);
  };

  /*
    进入原生云存储
    3.17及以上
    @param
  */
  enterMessageAll = () => {
    CameraManager.gotoCameraMessageCenterPanel();
  };

  /*
    进入native消息中心
    3.20及以上
    theme: 主题色 黑色为1 白色为2
    @param
  */
  enterParamMessageAll = (param: { theme?: 1 | 2; [propName: string]: any }) => {
    CameraManager.gotoCameraMessageCenterPanelWithParams(param);
  };

  /*
    进入native消息中心预览界面
    3.17及以上        
    devId: 设备id
    msgId: 消息id
    msgTitle: 消息标题
    msgTime: 消息时间
    type: 媒体类型
    mediaUrl: 媒体url
    @param
  */
  enterMediaPlayerPreview = (params: {
    devId: string;
    msgId: string;
    msgTitle: string;
    msgTime: any;
    type: string;
    mediaUrl: string;
    [propName: string]: any;
  }) => {
    CameraManager.gotoMediaPlayer(params);
  };

  /*
    进入摄像头设置界面
  */
  enterCameraSetting = () => {
    CameraManager.gotoCameraPanelMore();
    TYEvent.emit('changeCameraAction', { action: 4, nativePage: 4 });
  };

  /*
     横竖屏切换
  */
  setScreenOrientation = (dir: 0 | 1) => {
    CameraManager.setScreenOrientation(dir);
    TYEvent.emit('screenOrientation', { isFullScreen: dir });
  };

  backPlayPreview = (disConnectP2P = false) => {
    exitPlayPreview(disConnectP2P);
  };

  exitPlayPreviewSpecial = () => {
    exitPlayPreviewByAudioOrOther();
  };

  /*
    断开P2P
  */
  disconnect = () => {
    CameraManager.disconnect();
  };

  /*
   从视频预览界面跳转到其它Rn界面
  */
  enterRnPage = (id, data) => {
    const TYNavigator = TYSdk.Navigator;
    TYEvent.emit('activeChangeScale', {});
    exitPlayPreview();
    TYNavigator.push({
      id,
      ...data,
    });
  };

  // 从非预览RN页面跳转至视频预览界面
  backNavigatorLivePlay = () => {
    const TYNavigator = TYSdk.Navigator;
    TYNavigator.pop();
  };

  // 从非预览RN页面跳转至视频预览界面组件销毁时调用
  backLivePlayWillUnmount = () => {
    TYEvent.emit('isEnterRnPage', false);
    TYEvent.emit('backLivePreview', '');
  };

  // 获取信号强度
  getWifiSignal = () => {
    return new Promise((resolve, reject) => {
      try {
        CameraManager.obtainWifiSignal((msg: any) => {
          const singalNum = typeof msg === 'string' || typeof msg === 'number' ? msg : 0;
          resolve({
            signalValue: singalNum,
          });
        });
      } catch (err) {
        reject({
          errMsg: JSON.stringify(err),
        });
      }
    });
  };

  // 获取手机当前是移动流量还是其它方式(宽带，wifi)播放 3.16
  isMobileNetType = () => {
    return new Promise((resolve, reject) => {
      try {
        CameraManager.isMobileDataNetworkType(result => {
          resolve({
            isMobileNetWork: result,
          });
        });
      } catch (err) {
        reject({
          errMsg: JSON.stringify(err),
        });
      }
    });
  };

  // 判定是否支持云存储无需P2P的连接
  isSupportedCloudStorage = () => {
    return new Promise((resolve, reject) => {
      CameraManager.isSupportedCloudStorage(msg => {
        resolve({
          isSupported: Boolean(msg),
        });
      });
    });
  };

  // 跳转H5页面
  gotoHybridContainer = h5Url => {
    CameraManager.gotoHybridContainer(h5Url);
  };
  // 切换为音频模式

  changeClarityAndAudio = (type: clarityDic) => {
    return new Promise((resolve, reject) => {
      CameraManager.startPreviewWithDefinition(
        decodeClarityDic[type],
        () => {
          let sendStreamStatus = 6;
          resolve({
            success: true,
          });
          type === 'AUDIO' && (sendStreamStatus = 7);
          TYEvent.emit('streamStatus', { status: sendStreamStatus });
        },
        (err: any) => {
          resolve({
            success: false,
            errMsg: JSON.stringify(err),
          });
        }
      );
    });
  };
}

export default new PlayerManagerFun();
