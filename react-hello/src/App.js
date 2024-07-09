import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

// 리액트의 사용자 정의태그의 이름은 반드시 대문자로 시작해야함
// 사용자 정의 태그는 리액트에서 ''컴포넌트''라고 부른다
function Header(props) {
  return <header>
      <h1><a href='/' onClick={(event)=>{
          event.preventDefault();
          props.onChangeMode();
      }}>{props.title}</a></h1>
    </header>
}

function Nav(props){
    let list = props.topics, map = list.map(t => <li key={t.id}>
        <a id={t.id} href={'/read/' + t.id} onClick={(event)=>{
            event.preventDefault();
            props.onChangeMode(event.target.id)
        }}>{t.title}</a>
    </li>);
    return <nav>
        <ul>
            {map}
        </ul>
    </nav>
}

function Article(props) {
  return <article>
    <h2>{props.title}</h2>
      {props.body}
  </article>
}

function Create(props) {
    return <article>
        <h2>Create</h2>
        <form action='' onSubmit={(event)=>{
            event.preventDefault();
            const title = event.target.title.value;
            const body = event.target.body.value;
            props.onCreate(title, body);
            event.target.title.value = '';
            event.target.body.value = ''
        }}>
            <p><input type='text' name='title' placeholder='title'/></p>
            <p><textarea name='body' placeholder='body' id='create-body' cols='30' rows='10'></textarea></p>
            <input type='submit'/>
        </form>
    </article>
}
function Update(props) {
    return <article>
        <h2>Update</h2>
        <form action='' onSubmit={(event)=>{
            event.preventDefault();
            const title = event.target.title.value;
            const body = event.target.body.value;
            props.onUpdate(title, body);
            event.target.title.value = '';
            event.target.body.value = ''
        }}>
            <p><input type='text' name='title' defaultValue={props.title} placeholder='title'/></p>
            <p><textarea name='body' defaultValue={props.body} placeholder='body' id='create-body' cols='30' rows='10'></textarea></p>
            <input type='submit'/>
        </form>
    </article>
}

function App() {
    const [topics, setTopics] = useState([
        {id:1, title:'html', body:'html is ...'},
        {id:2, title:'css', body:'css is ...'},
        {id:3, title:'js', body:'js is ...'}
    ]);
    let [mode, setMode] = useState('WELCOME');
    let [id, setId] = useState(null);
    let [nextId, setNextId] = useState(4);

    let content;
    let upateBtn = null
    if (mode == 'WELCOME')
        content = <Article title='Welcome' body='Welcome, React'></Article>
    if (mode == 'READ') {
        content = <Article title={topics[id - 1].title} body={topics[id - 1].body}></Article>
        upateBtn = <li><a href={'/update/' + id} onClick={(event) => {
            event.preventDefault();
            setMode('UPDATE')
        }}>Update</a></li>
    }
    if (mode == 'CREATE') {
        content = <Create onCreate={(title, body) => {
            const _topics = [...topics, {
                id: nextId, title: title, body: body
            }];
            setTopics(_topics);
            setMode('READ');
            setId(nextId);
            setNextId(nextId + 1);
        }}></Create>
    }
    if (mode == 'UPDATE') {
        content = <Update title={topics[id - 1].title} body={topics[id - 1].body} onUpdate={(title, body)=>{
            const _topics = [...topics];
            _topics[id - 1].title = title;
            _topics[id - 1].body = body;
            setTopics(_topics);
            setMode('READ');
            setId(id);
        }}></Update>
    }

  return (
    <div className='App'>

      <Header title='React1' onChangeMode={()=>{
          setMode('WELCOME');
      }}></Header>
      <Nav topics={topics} onChangeMode={(_id)=>{
          setMode('READ');
          setId(_id);
      }}></Nav>
        {content}
        <ul>
            <li><a href='/create' onClick={(event) => {
                event.preventDefault();
                setMode('CREATE');
            }}>Create</a></li>
            {upateBtn}
        </ul>
    </div>
  );
}

export default App;
