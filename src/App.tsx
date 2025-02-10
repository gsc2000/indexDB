import React, { useState } from 'react';
import { BrowserRouter as Router, Link as RouterLink, useLocation } from 'react-router-dom';
import './App.css';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// パンくずリストのマッピング
const breadcrumbNameMap: { [key: string]: string } = {
  'test': 'test',
};

// リストアイテムリンクコンポーネント
function ListItemLink(props: { to: string; open?: boolean; onClick?: () => void; children: React.ReactNode }) {
  const { to, open, onClick} = props;
  const primary = breadcrumbNameMap[to] || to;

  let icon = null;
  if (open != null) {
    icon = open ? <ExpandLess /> : <ExpandMore />;
  }

  return (
    <li>
      <ListItemButton component={RouterLink} to={to} onClick={onClick}>
        <ListItemText primary={primary} />
        {icon}
      </ListItemButton>
    </li>
  );
}

// リンクルーターコンポーネント
function LinkRouter(props: { to: string; replace?: boolean; children: React.ReactNode }) {
  return <RouterLink {...props} />;
}

// ページコンポーネント
function Page() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <LinkRouter to="/">Home</LinkRouter>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `${pathnames.slice(0, index + 1).join('/')}`;

        return last ? (
          <Typography key={to} color="textPrimary">
            {breadcrumbNameMap[to] || to}
          </Typography>
        ) : (
          <LinkRouter to={to} key={to}>
            {breadcrumbNameMap[to] || to}
          </LinkRouter>
        );
      })}
    </Breadcrumbs>
  );
}

// フォルダーのファイルリストを表示するコンポーネント
function FolderFileList({ folder, files, selectedFiles, handleSelectFile, handleDeleteFolder }: { folder: string; files: { [key: string]: any }, selectedFiles: File[], handleSelectFile: (file: File, folder: string) => void, handleDeleteFolder: (folder: string) => void }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">
        {folder}
        <Button onClick={() => handleDeleteFolder(folder)} color="secondary" size="small">Delete</Button>
      </Typography>
      <List>
        {files[folder].files.map((file: File, index: number) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={selectedFiles.includes(file)}
              onChange={() => handleSelectFile(file, folder)}
            />
            <ListItemText primary={file.name} />
          </Box>
        ))}
      </List>
    </Box>
  );
}

// フォルダーを再帰的に取得する関数
const getAllFolders = (folders: { [key: string]: any }): string[] => {
  return Object.keys(folders);
};

// フォルダーツリーコンポーネント
function FolderTree({ folders, parentPath = '', onSelectFolder }: { folders: { [key: string]: any }, parentPath?: string, onSelectFolder: (folder: string) => void }) {
  return (
    <List>
      {Object.keys(folders).sort().map((folder) => {
        const fullPath = parentPath ? `${parentPath}/${folder}` : folder;
        const displayPath = folder; // 表示するパスはフォルダ名のみ
        console.log('folder:', folder);
        return (
          <React.Fragment key={fullPath}>
            <ListItemLink to={fullPath} onClick={() => onSelectFolder(fullPath)}>
              {displayPath}
            </ListItemLink>
            {folders[folder].folders && (
              <Collapse in={true} timeout="auto" unmountOnExit>
                <FolderTree folders={folders[folder].folders} parentPath={fullPath} onSelectFolder={onSelectFolder} />
              </Collapse>
            )}
          </React.Fragment>
        );
      })}
    </List>
  );
}

// 上部表示コンポーネント
function UpperSection({ files, selectedFiles, handleSelectFile, handleDeleteFolder, onSelectFolder }: { files: { [key: string]: any }, selectedFiles: File[], handleSelectFile: (file: File, folder: string) => void, handleDeleteFolder: (folder: string) => void, onSelectFolder: (folder: string) => void }) {
  const [open, setOpen] = useState(true);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ bgcolor: 'lightblue', p: 2 }}>
      <Button onClick={handleToggle}>
        {open ? <ExpandLess /> : <ExpandMore />}
        {open ? 'Hide' : 'Show'} Folders
      </Button>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Page />
        <Box sx={{ bgcolor: 'background.paper', mt: 1 }} component="nav" aria-label="mailbox folders">
          <FolderTree folders={files} onSelectFolder={onSelectFolder} />
        </Box>
      </Collapse>
    </Box>
  );
}

// 下部表示コンポーネント
function LowerSection({ files, selectedFiles, handleSelectFile, handleDeleteFolder, selectedUploadFolder, setSelectedUploadFolder, handleFileUpload, selectedToFolder, setSelectedToFolder, handleMoveFiles, error, selectedParentFolder, setSelectedParentParentFolder, newFolderName, setNewFolderName, handleAddFolder }: { files: { [key: string]: any }, selectedFiles: File[], handleSelectFile: (file: File, folder: string) => void, handleDeleteFolder: (folder: string) => void, selectedUploadFolder: string, setSelectedUploadFolder: (folder: string) => void, handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void, selectedToFolder: string, setSelectedToFolder: (folder: string) => void, handleMoveFiles: (toFolder: string) => void, error: string | null, selectedParentFolder: string, setSelectedParentParentFolder: (folder: string) => void, newFolderName: string, setNewFolderName: (name: string) => void, handleAddFolder: () => void }) {
  return (
    <Box sx={{ bgcolor: 'lightgreen', p: 2 }}>
      <Typography variant="h6">Upload Files</Typography>
      <Select
        value={selectedUploadFolder}
        onChange={(e) => setSelectedUploadFolder(e.target.value as string)}
      >
        <MenuItem value="/">Root</MenuItem>
        {getAllFolders(files).map((folder) => (
          <MenuItem key={folder} value={folder}>{folder}</MenuItem>
        ))}
      </Select>
      <input type="file" multiple onChange={handleFileUpload} />
      <Typography variant="h6">Move Selected Files</Typography>
      <Select
        value={selectedToFolder}
        onChange={(e) => setSelectedToFolder(e.target.value as string)}
      >
        {getAllFolders(files).map((folder) => (
          <MenuItem key={folder} value={folder}>{folder}</MenuItem>
        ))}
      </Select>
      <button onClick={() => handleMoveFiles(selectedToFolder)}>Move to Selected Folder</button>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h6">Add New Folder</Typography>
      <Select
        value={selectedParentFolder}
        onChange={(e) => setSelectedParentParentFolder(e.target.value as string)}
        displayEmpty
      >
        <MenuItem value="/">Root</MenuItem>
        {getAllFolders(files).map((folder) => (
          <MenuItem key={folder} value={folder}>{folder}</MenuItem>
        ))}
      </Select>
      <TextField
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="New Folder Name"
      />
      <Button onClick={handleAddFolder} variant="contained" color="primary">Add Folder</Button>
      {Object.keys(files).map((folder) => (
        <FolderFileList
          key={folder}
          folder={folder}
          files={files}
          selectedFiles={selectedFiles}
          handleSelectFile={handleSelectFile}
          handleDeleteFolder={handleDeleteFolder}
        />
      ))}
    </Box>
  );
}

// 選択されたフォルダのファイルを表示するコンポーネント
function SelectedFolderFiles({ selectedFolder, files }: { selectedFolder: string, files: { [key: string]: any } }) {
  console.log('Selected folder:', selectedFolder);
  console.log('Files:', files);
  console.log('Files in selected folder:', files[selectedFolder]?.files);

  return (
    <Box sx={{ bgcolor: 'lightgray', p: 2, width: '100%' }}>
      <Typography variant="h6">Files in {selectedFolder}</Typography>
      <List>
        {files[selectedFolder]?.files && files[selectedFolder].files.length === 0 && console.log('No files in the selected folder')}
        {files[selectedFolder]?.files && files[selectedFolder].files.length > 0 ? (
          files[selectedFolder].files.map((file: File, index: number) => (
            <ListItemText key={index} primary={file.name} />
          ))
        ) : (
          <Typography>No files</Typography>
        )}
      </List>
    </Box>
  );
}

// メインアプリコンポーネント
function App() {
  const [files, setFiles] = useState<{ [key: string]: { files: File[], folders: { [key: string]: any } } }>({
    '/test': { files: [], folders: {} },
  });
  const [selectedToFolder, setSelectedToFolder] = useState('/test');
  const [selectedUploadFolder, setSelectedUploadFolder] = useState('/test');
  const [selectedFiles, setSelectedFiles] = useState<{ file: File, folder: string }[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentFolder, setSelectedParentFolder] = useState('/');
  const [selectedFolder, setSelectedFolder] = useState('/test');

  // ファイルアップロードのハンドラー
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    setFiles((prevFiles) => {
      const folderPath = selectedUploadFolder;
      if (!prevFiles[folderPath]) {
        setError(`フォルダ "${folderPath}" が存在しません。`);
        return prevFiles;
      }
      return {
        ...prevFiles,
        [folderPath]: {
          ...prevFiles[folderPath],
          files: [...prevFiles[folderPath].files, ...newFiles],
        },
      };
    });
  };

  // ファイルとフォルダ移動のハンドラー
  const handleMoveFilesAndFolders = (toFolder: string) => {
    const fromFolder = selectedFiles.length > 0 ? selectedFiles[0].folder : '';
    if (!fromFolder) return;

    if (fromFolder === toFolder) {
      setError('移動元と移動先のフォルダが同じです。');
      return;
    }

    setFiles((prevFiles) => {
      if (!prevFiles[fromFolder]) {
        setError(`フォルダ "${fromFolder}" が存在しません。`);
        return prevFiles;
      }
      if (!prevFiles[toFolder]) {
        setError(`フォルダ "${toFolder}" が存在しません。`);
        return prevFiles;
      }

      // ファイルの移動
      const filesToMove = selectedFiles.map((selected) => selected.file);
      const updatedFromFolderFiles = prevFiles[fromFolder].files.filter((file: File) => !filesToMove.includes(file));
      const updatedToFolderFiles = [...prevFiles[toFolder].files, ...filesToMove];

      // フォルダの移動
      const foldersToMove = selectedFolders.reduce((acc, folder) => {
        acc[folder] = prevFiles[fromFolder].folders[folder];
        delete prevFiles[fromFolder].folders[folder];
        return acc;
      }, {} as { [key: string]: any });

      return {
        ...prevFiles,
        [fromFolder]: {
          ...prevFiles[fromFolder],
          files: updatedFromFolderFiles,
          folders: { ...prevFiles[fromFolder].folders },
        },
        [toFolder]: {
          ...prevFiles[toFolder],
          files: updatedToFolderFiles,
          folders: { ...prevFiles[toFolder].folders, ...foldersToMove },
        },
      };
    });

    setSelectedFiles([]); // ファイル移動後に選択をリセット
    setSelectedFolders([]); // フォルダ移動後に選択をリセット
    setError(null); // エラーをリセット
  };

  // ファイル選択のハンドラー
  const handleSelectFile = (file: File, folder: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      const isSelected = prevSelectedFiles.some((selected) => selected.file === file);
      if (isSelected) {
        return prevSelectedFiles.filter((selected) => selected.file !== file);
      } else {
        return [...prevSelectedFiles, { file, folder }];
      }
    });
  };

  // 新しいフォルダを追加するハンドラー
  const handleAddFolder = () => {
    if (!newFolderName) return;
    const newFolderPath = selectedParentFolder === '/' ? `/${newFolderName}` : `${selectedParentFolder}/${newFolderName}`;
    if (files[newFolderPath]) {
      setError('同じ名前のフォルダが既に存在します。');
      return;
    }
    setFiles((prevFiles) => ({
      ...prevFiles,
      [newFolderPath]: { files: [], folders: {} },
    }));
    setNewFolderName('');
    setError(null); // エラーをリセット
  };

  // フォルダを削除するハンドラー
  const handleDeleteFolder = (folder: string) => {
    setFiles((prevFiles) => {
      const { [folder]: _, ...restFolders } = prevFiles;
      return restFolders;
    });
    setSelectedFiles((prevSelectedFiles) => prevSelectedFiles.filter((selected) => selected.folder !== folder));
    setSelectedFolders((prevSelectedFolders) => prevSelectedFolders.filter((selected) => selected !== folder));
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
          <UpperSection
            files={files}
            selectedFiles={selectedFiles.map((selected) => selected.file)}
            handleSelectFile={handleSelectFile}
            handleDeleteFolder={handleDeleteFolder}
            onSelectFolder={setSelectedFolder}
          />
          <LowerSection
            files={files}
            selectedFiles={selectedFiles.map((selected) => selected.file)}
            handleSelectFile={handleSelectFile}
            handleDeleteFolder={handleDeleteFolder}
            selectedUploadFolder={selectedUploadFolder}
            setSelectedUploadFolder={setSelectedUploadFolder}
            handleFileUpload={handleFileUpload}
            selectedToFolder={selectedToFolder}
            setSelectedToFolder={setSelectedToFolder}
            handleMoveFiles={handleMoveFilesAndFolders}
            error={error}
            selectedParentFolder={selectedParentFolder}
            setSelectedParentParentFolder={setSelectedParentFolder}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            handleAddFolder={handleAddFolder}
          />
        </Box>
        <Box sx={{ width: '50%' }}>
          <SelectedFolderFiles selectedFolder={selectedFolder} files={files} />
        </Box>
      </Box>
    </Router>
  );
}

export default App;