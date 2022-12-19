# 可安装的在线中华农历

这是一个网页应用，也可安装到手机上离线运行。

本农历覆盖日期范围从1900年到2099年，包含二十四节气、阳历和阴历节假日、调休和调班、属相、天干地支、四柱八字等信息。

## 排历说明
1. 本日历程序排历的基准时间是北京时间.
  1. 阴历年、月的更替（农历月首）是根据北京时间（东经120度）的朔月确定；
  1. 二十四节气所在日期按北京时间设定；
  1. 所显示的节气精确时刻是北京时间；
  1. 每日子时的四柱八字是依据该日北京时间00:00计算所得。
1. 准确的年柱、月柱更替时刻是在每月节令（第一个节气）的发生时刻。

## 在线中华农历
访问网址：https://johnwu-pro.github.io/calendar/index.html.

# 参考指引
+ https://baike.baidu.com/item/农历/67925
+ https://www.haomeili.net/RiLi/wannianli
+ http://www.nongli.com
+ http://en.wikipedia.org/wiki/Equinox
+ http://www.ephemeris.com
+ https://www.laohuangli.net/
+ https://destiny.to/app/calendar/SolarTerms

# Project Development
#### Setup
The [http-server](https://github.com/http-party/http-server) is used for local development and manual testing.

To install http-server (globally):
```
npm install --global http-server
```

To setup local directory structure
```
# Windows commands
cd <project-dir>
mkdir ..\http-server.public
mklink /J ..\http-server.public\calendar .
```
OR
```
# Linux/Unix commands
cd <project-dir>
mkdir -p ../http-server.public
ln ./ ../http-server.public/calendar/
```

#### Running locally
```
http-server ../http-server.public/ -c-1 -p 9088

# then, open http://localhost:9088/calendar/index.html
```

#### Deploy / Publish
1. Push the changes to remote (`git@github.com:JohnWu-Pro/calendar.git`).
2. Open https://johnwu-pro.github.io/calendar/index.html?v=123.
   * NOTE: Using `?v=<random-number>` to workaround issues caused by page `index.html` caching.
