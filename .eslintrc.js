import LockConfig from './packages/tuya-panel-lock-sdk/src/apiConfig'

module.exports = {
  extends: ['tuya-panel'],
  plugins: ['literal-check'],
  rules: {
    'literal-check/literal-check': [
      2,
      ['tuya.'],
      [
        'tuya.m.device.media.latest',
        'tuya.m.device.media.detail',
        'tuya.m.sweeper.cleaning.history.get',
        'tuya.m.sweeper.cleaning.history.delete',
        'tuya.m.dev.common.file.list',
        'tuya.m.linkage.rule.product.query',
        'tuya.m.linkage.dev.warn.set',
        'tuya.m.bill.config.get',
        'tuya.m.bill.config.update',
        'tuya.m.bill.config.currency.list',
        'tuya.m.group.dpname.update',
        'tuya.m.public.weather.get',
        'tuya.m.linkage.rule.bind.wifi.query',
        'tuya.m.linkage.rule.brief.query',
        'tuya.m.linkage.rule.bind.wifi.save',
        'tuya.m.linkage.rule.bind.wifi.remove',
        'tuya.m.linkage.rule.trigger',
        'tuya.m.smart.operate.all.log',
        'tuya.m.dp.stat.days.list',
        'tuya.m.dp.stat.month.list',
        'tuya.m.dp.rang.stat.hour.list',
        'tuya.m.dp.rang.stat.day.list',
        'tuya.m.dp.rang.stat.week.list',
        'tuya.m.dp.rang.stat.month.list',
        'tuya.m.dp.stat.total',
        'tuya.m.device.query.device.log',
        'tuya.m.clock.dps.add',
        'tuya.m.clock.dps.list',
        'tuya.m.clock.dps.update',
        'tuya.m.clock.dps.group.add',
        'tuya.m.clock.dps.group.list',
        'tuya.m.clock.dps.group.update',
        'tuya.m.clock.batch.status.update',
        'tuya.m.clock.category.status.update',
        'tuya.m.timer.nearest.get',
        'tuya.m.public.weathers.get',
        'tuya.m.device.customize.position.save',
        'tuya.m.device.customize.position.get',
        'tuya.m.timer.astronomical.list',
        'tuya.m.timer.astronomical.add',
        'tuya.m.timer.astronomical.update',
        'tuya.m.timer.astronomical.status.update',
        'tuya.m.timer.astronomical.remove',
        'tuya.m.linkage.dev.list',
        'tuya.m.linkage.rule.brief.query',
        'tuya.m.linkage.associative.entity.id.category.query',
        'tuya.m.linkage.associative.entity.bind',
        'tuya.m.linkage.associative.entity.remove',
        'tuya.m.linkage.rule.trigger',
        'tuya.m.linkage.rule.enable',
        'tuya.m.linkage.rule.disable',
        ...LockConfig,
      ],
    ],
    'react/forbid-prop-types': 0,
  },
};
