import React from 'react';
import {TweenMax, TimelineLite} from 'gsap';
import './DrawSVGPlugin';
import SplitText from './SplitText';

export default class About extends React.Component {
  constructor(props, _railsContext) {
    super(props);

    this.state = {
      emoji: null,
      showEmojiSet: false,
      showEmojiForm: false,
      showMessageForm: false,
      displayedInteractions: [],
      currentPreference: null,
      currentPreferenceSelection: null,
      preferences: {
        whoami: [
          { title: 'Farm', image_src: 'mountain.jpg', description: 'May your trails be crooked, winding, lonesome, dangerous, leading to the most amazing view... Edward Abbey'},
          { title: 'Coffee', image_src: 'berries.jpg', description: 'Family tradition ☕'},
          { title: 'Still Climbing', image_src: 'stillClimbing.jpg', description: 'Fam Jam time ❤️'}
        ],

        career: [
          { title: 'Fav Developer', image_src: 'fave-dev.jpg', description: "I love Karim Maaloul's work. Check it out at http://yakudoo.com/"},
          { title: 'Fav App', image_src: 'paperplanes.jpg', description: 'I identify with the concept of Paper Planes by Active Theory. It comprises most of the stuff I would like to be able to do as a developer. https://paperplanes.world/'},
          { title: 'Inspiration', image_src: 'inspired.jpg', description: 'Active Theory'}
        ],

        passions: [
          { title: 'Fav Place', image_src: 'alps.jpg', description: 'The alps'},
          { title: 'Fav Book', image_src: 'littlePrince.jpg', description: 'The Little Prince'},
          { title: 'Obsession: Lavender', image_src: 'lavender.jpg', description: 'I love it badly'}
        ]
      }
    };

    this.interactions = [];
  }

  componentDidMount() {
    this.fetchInteractions();

    document.addEventListener('keydown', (e) => {
      console.log(e.code);
      if (e.code === 'Space') {
        this.pausePlay();
      } else if (e.code === 'Escape') {
        this.cancelEmojify(e);
        this.hideMessageForm(e);
        this.onClosePreferenceSelection();
      }
    });
  }

  timeUpdate(e) {
    const currentTime = this.video.currentTime;
    const duration = this.video.duration;
    const progress = (currentTime / duration) * 100;
    this.timeMarker.style.left = `${progress}%`;
    this.filledTimeMarker.style.width = `${progress}%`;
    this.updateDisplayedInteractions();

    if (currentTime === duration) {
      this.pause();
    }

    if (currentTime >= 237) {
      this.setState({currentPreference: 'passions'})
    } else if (currentTime >= 132) {
      this.setState({currentPreference: 'career'})
    } else if (currentTime >= 8) {
      this.setState({currentPreference: 'whoami'})
    } else {
      this.setState({currentPreference: ''})
    }

    if (currentTime >= 8) {
      this.setState({
        showEmojiSet: true
      });
    }
  }

  pausePlay() {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  markerClick(e, seconds) {
    e.preventDefault();
    e.stopPropagation();
    this.video.currentTime = seconds;
    this.play();
  }

  emojify(e, emoji) {
    e.preventDefault();
    this.pause();
    this.hideMessageForm(e);

    this.setState({
      emoji: emoji,
      showEmojiForm: true
    });
  }

  cancelEmojify(e) {
    e.preventDefault();
    this.setState({
      showEmojiForm: false
    });
  }

  fetchInteractions() {
    fetch('/interactions')
      .then((response) => response.json())
      .then((interactions) => {
        this.interactions = interactions.map((interaction) => {
          interaction.style = {
            top: `${(Math.random() * 60) + 20}%`,
            left: `${(Math.random() * 60) + 20}%`
          }
          interaction.className = 'interaction-normal';
          return interaction;
        })
      });
  }

  showMessageForm = (e) => {
    e.preventDefault();
    this.cancelEmojify(e);
    this.setState({
      showMessageForm: true,
      emoji: '💌'
    })
  }

  hideMessageForm = (e) => {
    e.preventDefault();
    this.setState({
      showMessageForm: false
    })
  }

  updateDisplayedInteractions() {
    const newDisplayedInteractions = this.interactions.filter((interaction) => {
      return (Math.abs(this.video.currentTime - interaction.current_time) < 5);
    });
    this.setState({
      displayedInteractions: newDisplayedInteractions
    });
  }

  submitEmoji(e) {
    e.preventDefault();
    this.play();
    this.setState({
      showEmojiForm: false
    });
    this.postInteraction(this.nameInput.value, '');
  }

  play = () => {
    this.video.play();
    this.playButton.style.display = 'none';
    this.pauseButton.style.display = 'block';
  }

  pause = () => {
    this.video.pause();
    this.pauseButton.style.display = 'none';
    this.playButton.style.display = 'block';
  }

  postInteraction = (name, comment) => {
    // Send data to Rails endpoint
    fetch('/interactions', {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        'interaction': {
          'name': name,
          'emoji': this.state.emoji,
          'comment': comment,
          'current_time': Math.floor(this.video.currentTime)
        }
      })
    })
    .then(response => response.json())
    .then((interaction) => {
      interaction.style = {
        top: `${(Math.random() * 60) + 20}%`,
        left: `${(Math.random() * 60) + 20}%`
      };
      interaction.className = 'interaction-new';
      this.interactions.push(interaction);
      this.updateDisplayedInteractions();
    })
  }

  submitMessageForm = (name, comment) => {
    this.setState({
      showMessageForm: false
    });
    this.postInteraction(name, comment);
    this.play();
  }

  timelineClick = (e) => {
    e.preventDefault();
    const percentClick = (e.clientX - this.timeline.offsetLeft) / this.timeline.clientWidth;
    this.video.currentTime = percentClick * this.video.duration;
  }

  onPreferenceSelection = (index) => {
    this.setState({currentPreferenceSelection: index});
    this.pause();
  }

  onClosePreferenceSelection = () => {
    this.setState({currentPreferenceSelection: null});
    this.play();
  }

  renderInteractions() {
    return this.state.displayedInteractions.map((interaction) => {
      return (
        <div className="interaction" key={interaction.id} style={interaction.style}>
          <div className="interaction-emoji">
            <div className="interaction-name">
              <p className="user-name">{interaction.name}</p>
              {
                interaction.comment ?
                  <p className="user-comment">{interaction.comment}</p>
                  : null
              }
            </div>
            <div className={interaction.className}>{interaction.emoji}</div>
          </div>
        </div>
      )
    })
  }

  render() {
    return(
      <div className="player-container">
        { this.state.preferences[this.state.currentPreference] ?
          <div className="preferences-bar">
            {this.state.preferences[this.state.currentPreference].map((preference, index) => {
              return (
                <div
                  className="preference"
                  key={preference.title}
                  onClick={() => this.onPreferenceSelection(index)}
                >
                  <h4>{preference.title}</h4>
                  <img src={preference.image_src} alt={preference.title}/>
                </div>
              )
            })}
          </div>
          : <div className="preferences-bar hidden"></div>
        }

        <div className="player">

          {
            this.state.currentPreferenceSelection !== null ?
              <div
                className="preferences-overlay"
                style={{backgroundImage: `url('${this.state.preferences[this.state.currentPreference][this.state.currentPreferenceSelection].image_src}')`}}>
                <span className="close-img" onClick={() => this.onClosePreferenceSelection()}>⊗</span>
                <p>{this.state.preferences[this.state.currentPreference][this.state.currentPreferenceSelection].description}</p>
              </div>
            : null
          }

          <div className="video-container">
            <video
              src="/about.mp4"
              poster="inst.png"
              onTimeUpdate={(e) => this.timeUpdate(e)}
              ref={(video) => this.video = video}
              onClick={(e) => this.showMessageForm(e)}>
            </video>

            {this.renderInteractions()}

            {
              this.state.showEmojiSet ?
              <div className="emojis">
                <div className="emoji crazy" onClick={(e) => this.emojify(e, '😜')}>😜</div>
                <div className="emoji like" onClick={(e) => this.emojify(e, '👍')}>👍</div>
                <div className="emoji love" onClick={(e) => this.emojify(e, '❤️')}>❤️</div>
              </div>

              : null
            }

            { this.state.showEmojiForm ?
              <div className="emoji-form-container">
                <div className="emoji-form">
                  <form onSubmit={(e) => this.submitEmoji(e)}>
                    <label className="emoji-input-label" htmlFor="name">Name</label>
                    <input className="emoji-input" type="text" ref={(input) => this.nameInput = input} required/>
                    <div className="buttons">
                      <button type="submit" className="emoji-form-submit">Place {this.state.emoji}</button>
                      <button className="emoji-form-cancel" onClick={(e) => this.cancelEmojify(e)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
              : null
            }

            { this.state.showMessageForm ?
              <MessageForm
                hideMessageForm={this.hideMessageForm}
                submitMessageForm={this.submitMessageForm}
              />
              : null
            }
          </div>

          <div className="timeline" ref={(div) => this.timeline = div} onClick={(e) => this.timelineClick(e)}>
            <div className="play" ref={(div) => this.playButton = div} onClick={(e) => {e.stopPropagation(); this.play()}}>
              <img src="play.png" alt="play-icon"/>
            </div>
            <div className="pause" ref={(div) => this.pauseButton = div} onClick={(e) => {e.stopPropagation(); this.pause()}}>
              <img src="pause.png" alt="pause-icon"/>
            </div>

            <div className="time-marker" ref={(div) => this.timeMarker = div}></div>
            <div className="empty-time-marker"></div>
            <div className="filled-time-marker" ref={(div) => this.filledTimeMarker = div}></div>

            <div className="marker me" onClick={(e) => this.markerClick(e, 8)}>
              <div className="tooltip">
                <img src="tobermory.jpg" alt=""/>
                <h4>Who am I</h4>
              </div>
            </div>

            <div className="marker work" onClick={(e) => this.markerClick(e, 132)}>
              <div className="tooltip">
                <img src="career.jpg" alt="image"/>
                <h4>Career stuff</h4>
              </div>
            </div>

            <div className="marker passions" onClick={(e) => this.markerClick(e, 237)}>
              <div className="tooltip">
                <img src="interests.jpg" alt="image"/>
                <h4>Interests</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class MessageForm extends React.Component {
  submitMessageForm = (e) => {
    e.preventDefault();
    this.props.submitMessageForm(this.nameInput.value, this.commentInput.value);
  }

  render() {
    return (
      <div className="message-form">
        <form className="video-form" onSubmit={(e) => this.submitMessageForm(e)}>
          <label className="message-input-label" htmlFor="name">Name</label>
          <input className="message-input" type="text" required ref={(input) => this.nameInput = input}/>

          <label className="message-textarea-label" htmlFor="comment">Comment</label>
          <textarea className="message-input" required ref={(input) => this.commentInput = input}></textarea>

          <div className="buttons">
            <button type="submit">Post</button>
            <button onClick={(e) => this.props.hideMessageForm(e)}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }
}
