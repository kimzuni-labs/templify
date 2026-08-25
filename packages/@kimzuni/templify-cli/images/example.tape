# 1. output & theme setting
Output example.gif
Set FontSize 18
Set Width 1200
Set Height 450
Set Padding 30
Set BorderRadius 10
Set TypingSpeed 0.015

# 2. terminal setting
Hide
Set Shell "bash"
Env PS1 "\[\033[31;1m\]$\[\033[0m\] "
Type@0ms "bun run build"
Enter
Type@0ms 'alias templify="node \"$(dirname $(pwd))/dist/index.mjs\""'
Enter
Type@0ms "jo -p key1=hello key2=world > .data.json"
Enter
Type@0ms "clear"
Enter
Sleep 500ms
Show

# with --template
Sleep 500ms
Type 'templify --template "{ key1 }, { key2 }!" key1=hello key2=world; echo'
Sleep 500ms
Enter
Sleep 500ms

# with pipeline
Enter
Type 'echo "{ key1 }, { key2 }!" | templify key1=hello key2=world'
Sleep 500ms
Enter
Sleep 500ms

# with custom open/close and 
Enter
Type 'echo "{{ key1 }}, { key2 }!" | templify key1=hello key2=world --open "{{" --close "}}"'
Sleep 500ms
Enter
Sleep 500ms

# with custom open/close (with no match)
Enter
Type 'cat .data.json'
Sleep 500ms
Enter
Sleep 500ms
Type 'echo "{ key1 }, { USER }!" | templify --from-env --data-file .data.json'
Sleep 500ms
Enter

Sleep 5s
