// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const playlist = $('.playlist');
const cd = $('.cd');
const progress = $('#progress');
const audio = $('#audio');
const player = $('.player');
const cdThumb = $('.cd-thumb');
const heading = $('header h2');
const playBtn = $('.btn-toggle-play');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const PLAYER_STORAGE_KEY = 'F8_PLAYER';


const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  songs: [
    {
      name: "Muộn rồi mà sao còn",
      singer: "Sơn Tùng MTP",
      path: "music/muon-roi-ma-sao-con.mp3",
      image:
        "picture/muon-roi-ma-sao-con.jpg"
    },
    {
      name: "Độ tộc 2",
      singer: "Phúc Du x Pháo x Mixigaming",
      path: "music/do-toc.mp3",
      image:
        "picture/do-toc-2.jpg"
    },
    {
      name: "Phải chăng em đã yêu",
      singer: "Yuki San",
      path: "music/phai-chang-em-da-yeu.mp3",
      image:
        "picture/phai-chang-em-da-yeu.jpg"

    },
    {
      name: "Có hẹn với thanh xuân",
      singer: "Monstar",
      path: "music/co-hen-voi-thanh-xuan.mp3",
      image:
        "picture/co-hen-voi-thanh-xuan.jpg"
    },
    {
      name: "Đi đu đưa đi",
      singer: "Bích Phương",
      path: "music/di-du-dua-di.mp3",
      image:
        "picture/di-du-dua-di.jpg"
    },
    {
      name: "Sài Gòn đau lòng quá",
      singer: "Hứa Kim Tuyền x Hoàng Duyên",
      path: "music/sai-gon-dau-long-qua.mp3",
      image:
        "picture/sai-gon-dau-long-qua.jpg"
    },
    {
      name: "Cưới thôi",
      singer: "Masew,Masiu,B Ray,TAP",
      path: "music/cuoi-thoi.mp3",
      image:
        "picture/cuoi-thoi.jpg"
    },
    {
      name: "Mời anh vào team em",
      singer: "Chi Pu",
      path: "music/moi-anh-vao-team-em.mp3",
      image:
        "picture/moi-anh-vao-team-em.jpg"
    },

  ],
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      }
    })
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
    });
    playlist.innerHTML = htmls.join('');
  },
  //Xử lí các sự kiện
  handleEvents: function () {
    const _this = this;//Vì bên trong function thì cái this ko còn là cái app nữa
    const cdWidth = cd.offsetWidth;
    //Xử lý CD quay/dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg' }
    ],
      {
        duration: 10000, //10seconds
        iterations: Infinity
      })

    //Xử lí phóng to/ thu nhỏ CD
    document.onscroll = function () {
      //VÌ có thể có nhiều ứng dụng ko dùng scrollY, nên:
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      //Vì khi kéo nhanh quá sẽ bị ra số âm, nên:
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    }

    //Xử lí khi ấn play
    playBtn.onclick = function () {
      if (_this.isPlaying)
        audio.pause();
      else
        audio.play();
    }
    cdThumbAnimate.pause();

    // Khi song được ấn play:
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimate.play();
      _this.render();
      _this.scrollToActiveSong();
    }
    //Khi song bị ấn pause:
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimate.pause();
    }
    //thanh tiến độ chạy khi bài hát chạy
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
        progress.value = progressPercent;
      }
    }

    //Xử lí khi tua song
    progress.onchange = function (e) {
      const seekTime = e.target.value * audio.duration / 100;
      audio.currentTime = seekTime;
    }
    //khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) _this.playRandomSong();
      else _this.nextSong();
      audio.play();
    }
    //Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) _this.playRandomSong();
      else _this.prevSong();
      audio.play();
    }
    //Khi bật/tắt random bài hát
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    }
    //Khi bài hát kết thúc
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      }
      else {
        nextBtn.click();
      }
    }
    //Khi bật/tắt repeat
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      this.classList.toggle('active', _this.isRepeat);
    }
    // Khi chọn bài hát bất kì khác bài đang active
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active');
      if (e.target.closest('.song:not(.active') || e.target.closest('.option')) {
        if (e.target.closest('.song:not(.active')) {
          //_this.currentIndex=songNode.getAttribute('data-index');
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        if (e.target.closest('.option')) {
          alert('chưa biết làm gì :)')
        }
      }
    }




  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();

  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();

  },
  playRandomSong: function () {
    let newRandom;
    do {
      newRandom = Math.floor(Math.random() * this.songs.length);
    }
    while (newRandom === this.currentIndex);
    this.currentIndex = newRandom;
    this.loadCurrentSong();
  },
  //Khi next/prev song thì active chạy theo view
  scrollToActiveSong: function () {
    const activeSong = $('.song.active');

    if (this.currentIndex <= 3) {
      setTimeout(() => {
        activeSong.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        })
      }, 300)
    }
    else {
      setTimeout(() => {
        activeSong.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }, 300)
    }

  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    //Object.assign(this, this.config);

  },



  start: function () {

    //Gán cấu hinh từ config vào app
    this.loadConfig();

    //ĐỊnh nghĩa các thuộc tính cho object
    this.defineProperties();

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();


    //Lắng nghe/xử lý các sự kiện( DOM events)
    this.handleEvents();

    //render playlist
    this.render();

    //Hiển thị trạng thái ban đầu của Repeat và Random
    randomBtn.classList.toggle('active', this.isRandom);
    repeatBtn.classList.toggle('active', this.isRepeat);


  }

}
app.start();