@echo off

echo Adicionando e commitando (git add . / git commit)...
git add .
git commit -m "Atualizacao automatica rapida: Quick Sync"
IF %ERRORLEVEL% NEQ 0 GOTO :GIT_ERROR

echo.
echo Enviando para o GitHub (git push)...
git push
IF %ERRORLEVEL% NEQ 0 GOTO :GIT_ERROR

echo.
echo Quick Sync concluida com sucesso!
GOTO :END

:GIT_ERROR
echo.
echo ERRO: Ocorreu um erro durante a execucao do comando Git.
echo (Pode ser que nao haja alteracoes para commitar)

:END
echo.
pause