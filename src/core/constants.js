/**
 * 常量定义模块
 * 包含 XMP 模板、视频编码格式等常量
 */

// 正确的 Google Motion Photo V2 XMP 模板
// 参考: https://developer.android.com/media/platform/motion-photo
// 使用正确的命名空间: GCamera, Container, Item
const XMP_TEMPLATE = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.1.0-jc003">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:GCamera="http://ns.google.com/photos/1.0/camera/"
        xmlns:Container="http://ns.google.com/photos/1.0/container/"
        xmlns:Item="http://ns.google.com/photos/1.0/container/item/"
      GCamera:MotionPhoto="1"
      GCamera:MotionPhotoVersion="1"
      GCamera:MotionPhotoPresentationTimestampUs="{TIMESTAMP_US}">
      <Container:Directory>
        <rdf:Seq>
          <rdf:li rdf:parseType="Resource">
            <Container:Item
              Item:Mime="image/jpeg"
              Item:Semantic="Primary"/>
          </rdf:li>
          <rdf:li rdf:parseType="Resource">
            <Container:Item
              Item:Mime="video/mp4"
              Item:Semantic="MotionPhoto"
              Item:Length="{VIDEO_LENGTH}"
              Item:Padding="0"/>
          </rdf:li>
        </rdf:Seq>
      </Container:Directory>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

// 三星/小米旧版 MicroVideo 格式
const MICROVIDEO_TEMPLATE = `{"micro":1,"microType":1,"microVer":1,"offset":{OFFSET},"tailOffset":0}`;

// 视频编码格式选项
const VideoCodec = {
    H264: 'h264',
    HEVC: 'hevc',
    COPY: 'copy'
};

// 视频编码描述
const VideoCodecDescription = {
    [VideoCodec.H264]: 'H.264/AVC - 兼容性最好，支持所有设备',
    [VideoCodec.HEVC]: 'H.265/HEVC - 更好的压缩率，但兼容性较差',
    [VideoCodec.COPY]: '不重新编码，直接复制原视频'
};

// JPEG 标记
const JpegMarkers = {
    SOI: 0xD8,   // Start of Image
    EOI: 0xD9,   // End of Image
    APP0: 0xE0,  // JFIF
    APP1: 0xE1,  // EXIF / XMP
    APP2: 0xE2,
    APP15: 0xEF,
    SOF0: 0xC0,  // Start of Frame
    SOF2: 0xC2,
    DHT: 0xC4,   // Define Huffman Table
    DQT: 0xDB,   // Define Quantization Table
    SOS: 0xDA    // Start of Scan
};

// MP4 Box 类型
const Mp4Boxes = {
    FTYP: 'ftyp',
    MOOV: 'moov',
    MDAT: 'mdat'
};

module.exports = {
    XMP_TEMPLATE,
    MICROVIDEO_TEMPLATE,
    VideoCodec,
    VideoCodecDescription,
    JpegMarkers,
    Mp4Boxes
};
